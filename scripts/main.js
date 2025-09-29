import { simularDinamica } from './contigua.js';
import { cargarYValidarArchivo, validarDatosMemoria } from './validacion.js';
import { descargarLog, limpiarLog, logResumenResultados } from './descarga.js';
import * as co from './control.js';
import * as ui from './ui.js';

const CONFIG = {
    MENSAJES: {
        CARGANDO: 'Cargando archivo...',
        SIMULANDO: 'Ejecutando simulación...',
        COMPLETADO: 'Simulación completada',
        ERROR_NO_ARCHIVO: 'No se seleccionó ningún archivo',
        ERROR_NO_PROCESOS: 'No hay procesos cargados',
        ERROR_SELECCIONAR_ESTRATEGIA: 'Seleccione una estrategia',
        ERROR_ARCHIVO_VALIDO: 'Primero debe cargar un archivo válido'
    }
};

const $ = sel => document.querySelector(sel);

const elementosArchivo = {
    input: $('#file'),
    vistaContinuar: $('#puedeSeguir'),
    formato: $('#formato'),
    descargarArchivo: $('#btnDescargar')
};

const configuracionMemoria = {
    total: $('#totalMemory'),
    memSo: $('#memoria-so'),
    estrategia: $('#strategy-select'),
    tiempoParticion: $('#partitionSelectionTime'),
    tiempoCarga: $('#averageLoadTime'),
    tiempoLiberacion: $('#partitionReleaseTime')
};

const elementosSimulacion = {
    ejecutarSimulacion: $('#runSimulation')
};

const elementosVisuales = {
    canvas: $('#memCanvas'),
    estadisticas: $('#stats'),
    tablaProcesos: $('#jobsTable'),
    pasoApaso: $('#logContainer')
};

let procesosCargados = null;
let estrategiaSeleccionada = null;
let resetInputs = false;

function configurarListeners() {
    const elementos = [
        { el: elementosArchivo.input, event: 'change', handler: manejarCargaArchivo, name: 'elementosArchivo.input' },
        { el: elementosArchivo.vistaContinuar, event: 'click', handler: manejarContinuar, name: 'elementosArchivo.vistaContinuar' },
        { el: configuracionMemoria.total, event: 'change', handler: validarConfiguracion, name: 'configuracionMemoria.total' },
        { el: configuracionMemoria.memSo, event: 'change', handler: validarConfiguracion, name: 'configuracionMemoria.memSo' },
        { el: configuracionMemoria.estrategia, event: 'change', handler: manejarCambioEstrategia, name: 'configuracionMemoria.estrategia' },
        { el: configuracionMemoria.tiempoParticion, event: 'change', handler: validarConfiguracion, name: 'configuracionMemoria.tiempoParticion' },
        { el: configuracionMemoria.tiempoCarga, event: 'change', handler: validarConfiguracion, name: 'configuracionMemoria.tiempoCarga' },
        { el: configuracionMemoria.tiempoLiberacion, event: 'change', handler: validarConfiguracion, name: 'configuracionMemoria.tiempoLiberacion' },
        { el: elementosSimulacion.ejecutarSimulacion, event: 'click', handler: ejecutarSimulacionHandler, name: 'elementosSimulacion.ejecutarSimulacion' },
        {
            el: elementosArchivo.descargarArchivo, event: 'click',
            handler: () => descargarLog(elementosArchivo.formato.value),
            name: 'elementosArchivo.descargarArchivo'
        },
    ];

    elementos.forEach(item => {
        if (item.el) {
            item.el.addEventListener(item.event, item.handler);
        } else {
            console.warn(`${item.name} no existe en el DOM`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    configurarListeners();
    co.ocultarTodasLasSecciones();
});

async function manejarCargaArchivo(evento) {
    const archivo = evento.target.files[0];
    limpiarResultadosAnteriores(true);
    co.ocultarTodasLasSecciones();

    if (!archivo) {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.ERROR_NO_ARCHIVO, 'error', elementosArchivo.input);
        return;
    }

    try {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.CARGANDO, 'loading', elementosArchivo.input);
        const valorMemoriaTotal = Number(configuracionMemoria.total.value);
        const { procesos, warnings } = await cargarYValidarArchivo(archivo, valorMemoriaTotal);

        procesosCargados = procesos;

        let mensaje = `Archivo válido: ${procesos.length} procesos cargados`;
        if (warnings.length > 0) {
            mensaje += `\n Advertencias: ${warnings.join(', ')}`;
        }

        co.mostrarEstadoArchivo(mensaje, 'success', elementosArchivo.input);
        co.habilitarBotonContinuar();

    } catch (error) {
        procesosCargados = null;
        co.mostrarEstadoArchivo(`Error: ${error.message}`, 'error', elementosArchivo.input);
        co.deshabilitarBotonContinuar();
    }
}

function manejarContinuar() {
    if (!procesosCargados) {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.ERROR_ARCHIVO_VALIDO, 'error', elementosArchivo.input);
        return;
    }
    co.mostrarInterfazPrincipal();
    co.ocultarSeccionesSimulacion();
}

function obtenerDatosMemoria() {
    const totalMemoria = Number(configuracionMemoria.total.value);
    const memoriaSO = Number(configuracionMemoria.memSo.value);

    return {
        totalMemory: totalMemoria,
        memSo: memoriaSO,
        userMemory: totalMemoria - memoriaSO,
        partitionSelectionTime: Number(configuracionMemoria.tiempoParticion.value),
        averageLoadTime: Number(configuracionMemoria.tiempoCarga.value),
        partitionReleaseTime: Number(configuracionMemoria.tiempoLiberacion.value)
    };
}

function validarConfiguracion() {
    limpiarResultadosAnteriores();
    co.ocultarSeccionesSimulacion();
    const datos = obtenerDatosMemoria();
    const validacion = validarDatosMemoria(datos);

    if (!validacion.isValid) {
        co.mostrarEstadoArchivo(`Error: ${validacion.errors.join(', ')}`, 'error', elementosArchivo.input);
    } else {
        co.mostrarEstadoArchivo('', 'success', elementosArchivo.input);
    }
    return validacion.isValid ? datos : null;
}

function manejarCambioEstrategia(evento) {
    const opcionSeleccionada = evento.target.selectedOptions[0];
    if (opcionSeleccionada) {
        estrategiaSeleccionada = opcionSeleccionada.dataset.strategy;
    }
    limpiarResultadosAnteriores();
    co.ocultarSeccionesSimulacion();
}

async function ejecutarSimulacionHandler() {
    const datosMemoria = validarConfiguracion();
    if (!datosMemoria) return;

    if (!estrategiaSeleccionada) {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.ERROR_SELECCIONAR_ESTRATEGIA, 'error', elementosArchivo.input);
        return;
    }

    await ejecutarSimulacion(estrategiaSeleccionada, datosMemoria);
}

async function ejecutarSimulacion(estrategia, datosMemoria) {
    if (!procesosCargados) {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.ERROR_NO_PROCESOS, 'error', elementosArchivo.input);
        return;
    }

    co.mostrarSeccionesSimulacion();

    try {
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.SIMULANDO, 'loading', elementosArchivo.input);

        const tiemposConfig = {
            tiempoSeleccionParticion: datosMemoria.partitionSelectionTime,
            tiempoCargaPromedio: datosMemoria.averageLoadTime,
            tiempoLiberacionParticion: datosMemoria.partitionReleaseTime
        };

        const procesosClonados = procesosCargados.map(p => ({ ...p }));
        limpiarLog();
        ui.limpiarEventoLog();
        const resultados = simularDinamica(datosMemoria.userMemory, procesosClonados, estrategia, tiemposConfig, datosMemoria.memSo);

        ui.mostrarEstadisticas(resultados, estrategia, elementosVisuales.estadisticas);
        ui.mostrarTablaProcesos(resultados.retornos, elementosVisuales.tablaProcesos);

        const memoriaTotal = resultados.memoriaUsuario + resultados.memSo;
        ui.mostrarLineaTiempoMemoria('memCanvas', resultados.retornos, memoriaTotal, resultados.tiempoTotal, resultados.memSo);

        logResumenResultados(estrategia, resultados);
        co.mostrarEstadoArchivo(CONFIG.MENSAJES.COMPLETADO, 'success', elementosArchivo.input);

    } catch (error) {
        console.error('Error en simulación:', error);
        co.mostrarEstadoArchivo(`Error en simulación: ${error.message}`, 'error', elementosArchivo.input);
    }
}

function limpiarResultadosAnteriores(resetInputs = false) {
    elementosVisuales.estadisticas.innerHTML = '';
    elementosVisuales.tablaProcesos.innerHTML = '';

    const ctx = elementosVisuales.canvas.getContext('2d');
    ctx.clearRect(0, 0, elementosVisuales.canvas.width, elementosVisuales.canvas.height);
    co.ocultarVisualizacionMemoria();

    if (resetInputs) {
        if (configuracionMemoria.total) configuracionMemoria.total.value = 700;
        if (configuracionMemoria.memSo) configuracionMemoria.memSo.value = 200;
        if (configuracionMemoria.tiempoParticion) configuracionMemoria.tiempoParticion.value = 1;
        if (configuracionMemoria.tiempoCarga) configuracionMemoria.tiempoCarga.value = 1;
        if (configuracionMemoria.tiempoLiberacion) configuracionMemoria.tiempoLiberacion.value = 1;
        if (configuracionMemoria.estrategia) configuracionMemoria.estrategia.selectedIndex = 0;
    }
}