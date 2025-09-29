import { buscarIndiceBloque } from './algoritmos.js';
import { asignarBloque, liberarProceso } from './memoria.js';
import { agregarEventoLog } from './ui.js';
import { logConfiguracionInicial, logEstadoParticiones } from './descarga.js';

function avanzarTiempoConLog(desde, hasta) {//registro de tiempos en el caso de saltos de tiempo
    for (let tiempoActual = desde + 1; tiempoActual <= hasta; tiempoActual++) {
        agregarEventoLog(`--- Tiempo ${tiempoActual} ---`);
    }
}

export function simularDinamica(memoriaTotal, procesosRaw, estrategia, tiemposConfig, memoriaSO = 0) {
    const {
        tiempoSeleccionParticion = 0,
        tiempoCargaPromedio = 0,
        tiempoLiberacionParticion = 0
    } = tiemposConfig || {};

    const procesos = procesosRaw.map((j, i) => ({ ...j, idx: i }));//agrega indice original
    procesos.sort((a, b) => (a.tiempo_arribo - b.tiempo_arribo) || a.idx - b.idx);//orden de procesos por tiempo de arribo

    let bloques = [];
    if (memoriaSO > 0) { //estructura de memoria
        bloques.push({ start: 0, size: memoriaSO, free: false, jIdx: -1, esSO: true });
        bloques.push({ start: memoriaSO, size: memoriaTotal, free: true, jIdx: null });
    } else {
        bloques.push({ start: 0, size: memoriaTotal, free: true, jIdx: null });
    }
    logConfiguracionInicial(memoriaTotal, memoriaSO, estrategia, tiemposConfig, procesos);

    let t = 0;
    const esperando = procesos.map(j => ({ ...j }));
    const ejecutando = [];
    let procesosCompletadosPendientes = [];
    //array con datos de cada proceso
    const finalizacion = new Array(procesos.length).fill(null);
    const tiempoInicio = new Array(procesos.length).fill(null);
    const baseMemoria = new Array(procesos.length).fill(null);

    let iteraciones = 0;
    let fragExterna = 0;
    let posicionNextFit = 0;
    let tiempoTotalSeleccion = 0;
    let tiempoTotalCarga = 0;
    let tiempoTotalLiberacion = 0;
    logEstadoParticiones(bloques, t);
    agregarEventoLog(`--- Tiempo ${t} ---`);

    while (ejecutando.length > 0 || esperando.length > 0 || procesosCompletadosPendientes.length > 0) {
        iteraciones++;
        if (iteraciones > 10000) {
            throw new Error('Simulación abortada por bucle infinito');
        }
        let tiempoConsumidoEnEstaIteracion = 0;

        // fase 1: asignar memoria a trabajos en espera
        let seIntentoAsignar = true;
        while (seIntentoAsignar && esperando.length > 0) {
            seIntentoAsignar = false;
            const proceso = esperando[0];

            if (proceso.tiempo_arribo <= t) {
                let tiempoOperacion = 0; // tiempo total para la operacion actual

                if (tiempoSeleccionParticion > 0) {
                    agregarEventoLog(`Seleccionando partición para ${proceso.nombre} (${tiempoSeleccionParticion} uds)`);
                    tiempoTotalSeleccion += tiempoSeleccionParticion;
                    tiempoOperacion += tiempoSeleccionParticion;
                    agregarEventoLog(`Selección de partición completada para ${proceso.nombre}`);
                }

                const bq = buscarIndiceBloque(bloques, proceso.memoria_requerida, estrategia, posicionNextFit);

                if (bq !== -1) {
                    const bloque = bloques[bq];
                    baseMemoria[proceso.idx] = bloque.start;

                    if (tiempoCargaPromedio > 0) {
                        agregarEventoLog(`Cargando ${proceso.nombre} a memoria (${tiempoCargaPromedio} uds)`);
                        tiempoTotalCarga += tiempoCargaPromedio;
                        tiempoOperacion += tiempoCargaPromedio;
                        agregarEventoLog(`Carga completada para ${proceso.nombre}`);
                    }

                    if (tiempoOperacion > 0) {
                        const tiempoAnterior = t;
                        t += tiempoOperacion;
                        tiempoConsumidoEnEstaIteracion += tiempoOperacion;
                        avanzarTiempoConLog(tiempoAnterior, t);
                    }

                    agregarEventoLog(`${proceso.nombre} asignado en bloque ${bq} (estrategia ${estrategia})`);
                    logEstadoParticiones(bloques, t);

                    asignarBloque(bloques, bq, proceso.memoria_requerida, proceso.idx);
                    ejecutando.push({ jIdx: proceso.idx, remaining: proceso.duracion, base: proceso.base, memoria: proceso.memoria_requerida });

                    tiempoInicio[proceso.idx] = t;
                    bloque.free = false;
                    bloque.jIdx = proceso.idx;
                    esperando.shift();

                    if (estrategia === 'next') {
                        posicionNextFit = (bq + 1) % bloques.length;
                    }
                    break;
                } else {
                    agregarEventoLog(`No hay espacio para ${proceso.nombre} (${proceso.memoria_requerida}K)`);
                    break;
                }
            } else break;
        }

        // fase 2: calcular fragmentacion externa
        if (esperando.length > 0) {
            let externaEnEsteMomento = 0;
            for (const b of bloques) {
                if (b.free && !b.esSO) {
                    externaEnEsteMomento += b.size;
                }
            }
            fragExterna += externaEnEsteMomento;
        }

        // fase 3: avanzar ejecución y liberar trabajos completados (solo si no se consumió tiempo)
        if (tiempoConsumidoEnEstaIteracion === 0) {
            procesosCompletadosPendientes.forEach(nombreProceso => {
                agregarEventoLog(`${nombreProceso} completado`);
            });
            procesosCompletadosPendientes = [];
            for (let i = ejecutando.length - 1; i >= 0; i--) {
                ejecutando[i].remaining -= 1;
                if (ejecutando[i].remaining <= 0) {
                    const jIdx = ejecutando[i].jIdx;
                    if (!procesos[jIdx]) {
                        ejecutando.splice(i, 1);
                        continue;
                    }

                    let tiempoLiberacion = 0;
                    if (tiempoLiberacionParticion > 0) {
                        agregarEventoLog(`Liberando partición de ${procesos[jIdx].nombre} (${tiempoLiberacionParticion} uds)`);
                        tiempoTotalLiberacion += tiempoLiberacionParticion;
                        tiempoLiberacion = tiempoLiberacionParticion;
                    }

                    const tiempoFinalizacion = t + 1 + tiempoLiberacion;
                    finalizacion[jIdx] = tiempoFinalizacion;

                    const nombreProceso = procesos[jIdx].nombre;
                    procesosCompletadosPendientes.push(nombreProceso);
                    liberarProceso(bloques, jIdx);
                    logEstadoParticiones(bloques, tiempoFinalizacion);
                    ejecutando.splice(i, 1);

                    if (tiempoLiberacion > 0) {// si hay tiempo de liberacion, avanza el tiempo global
                        const tiempoAnterior = t;
                        t += tiempoLiberacion;
                        tiempoConsumidoEnEstaIteracion += tiempoLiberacion;
                        avanzarTiempoConLog(tiempoAnterior, t);
                        break;
                    }
                }
            }
        }

        if (tiempoConsumidoEnEstaIteracion === 0) {
            t += 1; //avaza aunque no ocurra alguna operacion
            agregarEventoLog(`--- Tiempo ${t} ---`);

            if (ejecutando.length === 0 && esperando.length > 0) {// verifica si necesitamos saltar al siguiente arribo
                const siguienteArribo = esperando[0].tiempo_arribo;
                if (siguienteArribo > t) {
                    const tiempoAnterior = t;
                    t = siguienteArribo;
                    avanzarTiempoConLog(tiempoAnterior, t);
                }
            }
        }

        const trabajosImposibles = esperando.filter(job =>
            job.tiempo_arribo <= t && job.memoria_requerida > memoriaTotal
        );

        if (trabajosImposibles.length > 0) {
            throw new Error(
                `Trabajos requieren más memoria que la disponible: ${trabajosImposibles.map(j => j.nombre).join(', ')}`
            );
        }

        if (esperando.length > 0 && ejecutando.length === 0) {
            const totalEsperando = esperando.reduce((sum, job) => sum + job.memoria_requerida, 0);
            const totalLibre = bloques.filter(b => b.free && !b.esSO).reduce((sum, b) => sum + b.size, 0);

            if (totalEsperando > totalLibre) {
                throw new Error(
                    `No hay suficiente memoria libre para los trabajos restantes. ` +
                    `Necesario: ${totalEsperando}K, Disponible: ${totalLibre}K`
                );
            }

            const procesoMasPequeno = Math.min(...esperando.map(j => j.memoria_requerida));
            const bloquesLibres = bloques.filter(b => b.free && !b.esSO);

            if (bloquesLibres.length === 0) {
                throw new Error(`No hay bloques libres disponibles`);
            }

            const bloqueLibreMasGrande = Math.max(...bloquesLibres.map(b => b.size));

            if (procesoMasPequeno > bloqueLibreMasGrande) {
                throw new Error(
                    `Fragmentación externa crítica: el proceso más pequeño requiere ${procesoMasPequeno}K ` +
                    `pero el bloque libre más grande tiene ${bloqueLibreMasGrande}K`
                );
            }
        }
    }

    // ajuste de tiempo final: si el último ciclo solo avanzo tiempo sin hacer nada util
    const ultimaFinalizacion = Math.max(...finalizacion.filter(f => f !== null));
    if (t > ultimaFinalizacion && ejecutando.length === 0 && esperando.length === 0) {
        t = ultimaFinalizacion;
    }

    const retornos = procesos.map((j) => {
        const arr = j.tiempo_arribo;
        const fin = finalizacion[j.idx];
        return {
            nombre: j.nombre,
            memoria: j.memoria_requerida,
            duracion: j.duracion,
            arribo: arr,
            inicio: tiempoInicio[j.idx],
            fin: fin,
            retorno: (fin != null) ? (fin - arr) : null,
            base: baseMemoria[j.idx]
        };
    });

    const totalRetorno = retornos.reduce((acc, x) => acc + (x.retorno || 0), 0)
    const avgRetorno = retornos.length > 0 ? totalRetorno / retornos.length : 0;
    agregarEventoLog("--- Fin de la simulación ---");
    logEstadoParticiones(bloques, t);

    return {
        tiempoTotal: t,
        retornos,
        promedioRetorno: avgRetorno,
        fragmentacionExterna: fragExterna,
        bloquesFinales: bloques,
        tiemposAcumulados: {
            totalSeleccion: tiempoTotalSeleccion,
            totalCarga: tiempoTotalCarga,
            totalLiberacion: tiempoTotalLiberacion
        },
        memSo: memoriaSO,
        memoriaUsuario: memoriaTotal,
    };
}
