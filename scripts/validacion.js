function leerArchivoTexto(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo) return reject(new Error("No se seleccionó archivo"));
        const lector = new FileReader(); // instancia para leer el archivo
        lector.onload = (e) => resolve(e.target.result); // contenido del archivo pasa a string
        lector.onerror = (e) => reject(new Error("Error leyendo archivo: " + e.target.error));
        lector.readAsText(archivo);
    });
}

function normalizarProceso(proceso, idx = 0) {
    return {
        nombre: proceso.nombre || proceso.name || `P${idx}`,
        tiempo_arribo: Number(proceso.tiempo_arribo ?? proceso.arribo ?? proceso.llegada ?? 0),
        duracion: Number(proceso.duracion ?? proceso.tiempo ?? proceso.duracion_proceso ?? 1),
        memoria_requerida: Number(proceso.memoria_requerida ?? proceso.memoria ?? proceso.ram ?? 1)
    };
}

function validarConsistenciaProcesos(procesos, memoriaTotal = Infinity) {
    const errores = [];
    const advertencias = [];
    const nombresVistos = new Set();

    if (!Array.isArray(procesos) || procesos.length === 0) {
        errores.push("No se encontraron procesos válidos");
        return { isValid: false, errors: errores, warnings: advertencias };
    }

    let ultimoArribo = -1;
    for (const proceso of procesos) {
        if (!proceso.nombre) {
            errores.push("Falta nombre de un proceso");
        } else {
            if (nombresVistos.has(proceso.nombre)) {
                errores.push(`Nombre duplicado: ${proceso.nombre}`);
            }
            nombresVistos.add(proceso.nombre);
        }
        if (isNaN(proceso.tiempo_arribo) || proceso.tiempo_arribo < 0) {
            errores.push(`Arribo inválido en ${proceso.nombre}`);
        } else if (proceso.tiempo_arribo < ultimoArribo) {
            advertencias.push(`Arribo de ${proceso.nombre} menor al anterior (posible desorden)`);
        }
        ultimoArribo = proceso.tiempo_arribo;
        if (isNaN(proceso.duracion) || proceso.duracion <= 0)
            errores.push(`Duración inválida en ${proceso.nombre}`);
        if (isNaN(proceso.memoria_requerida) || proceso.memoria_requerida <= 0) {
            errores.push(`Memoria inválida en ${proceso.nombre}`);
        } else if (proceso.memoria_requerida > memoriaTotal) {
            errores.push(
                `Proceso "${proceso.nombre}" pide ${proceso.memoria_requerida} > memoria total (${memoriaTotal})`
            );
        }
    }
    return { isValid: errores.length === 0, errors: errores, warnings: advertencias };
}

export async function cargarYValidarArchivo(archivo, memoriaTotal = Infinity) {
    if (!archivo) throw new Error("No se seleccionó archivo");

    const contenido = await leerArchivoTexto(archivo);
    const ext = archivo.name.split(".").pop().toLowerCase();

    let procesosRaw = [];
    if (ext === "json") {
        try {
            procesosRaw = JSON.parse(contenido);
            if (!Array.isArray(procesosRaw))
                throw new Error("El JSON debe contener un array de procesos");
        } catch (e) {
            throw new Error("JSON inválido: " + e.message);
        }
    } else if (ext === "txt") {
        const lineas = contenido
            .trim()
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith("#"));
        procesosRaw = lineas.map((linea, i) => {
            const partes = linea.split(/[,;\s\t]+/).filter(Boolean);
            if (partes.length < 4) {
                throw new Error(
                    `Línea ${i + 1} inválida: se esperan 4 campos (nombre, tiempo_arribo, duración, memoria_requerida)`
                );
            }
            return {
                nombre: partes[0],
                tiempo_arribo: Number(partes[1]),
                duracion: Number(partes[2]),
                memoria_requerida: Number(partes[3]),
            };
        });
    } else {
        throw new Error("Formato no soportado. Use .json o .txt");
    }
    const procesos = procesosRaw.map((j, i) => normalizarProceso(j, i));
    const { isValid, errors, warnings } = validarConsistenciaProcesos(procesos, memoriaTotal);
    if (!isValid) throw new Error(errors.join("\n"));

    return { procesos, warnings };
}

export function validarDatosMemoria(datos) {
    const errores = [];
    if (isNaN(datos.totalMemory) || datos.totalMemory <= 0)
        errores.push("Memoria total debe ser > 0");
    if (isNaN(datos.memSo) || datos.memSo < 0)
        errores.push("Memoria del SO debe ser => 0");
    if (isNaN(datos.userMemory) || datos.userMemory <= 0)
        errores.push("Memoria del usuario debe ser > 0");
    if (isNaN(datos.partitionSelectionTime) || datos.partitionSelectionTime < 0)
        errores.push("Tiempo de selección inválido");
    if (isNaN(datos.averageLoadTime) || datos.averageLoadTime < 0)
        errores.push("Tiempo de carga inválido");
    if (isNaN(datos.partitionReleaseTime) || datos.partitionReleaseTime < 0)
        errores.push("Tiempo de liberación inválido");

    return { isValid: errores.length === 0, errors: errores };
}
