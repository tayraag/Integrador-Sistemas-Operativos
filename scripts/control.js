const $ = sel => document.querySelector(sel);

export function ocultarInterfazPrincipal() {
    const contenedorPrincipal = $('#main-container');
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';
}

export function mostrarInterfazPrincipal() {
    const contenedorPrincipal = $('#main-container');
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'flex';
}

export function ocultarSeccionResultados() {
    const seccionResultados = $('#output');
    if (seccionResultados) seccionResultados.style.display = 'none';

    const seccionEventLog = $('#eventLog');
    if (seccionEventLog) seccionEventLog.style.display = 'none';
}

export function mostrarSeccionResultados() {
    const seccionResultados = $('#output');
    if (seccionResultados) seccionResultados.style.display = 'block';
}

export function ocultarTablaProcesos() {
    const elementos = document.querySelectorAll('section.card h3');
    for (const elemento of elementos) {
        if (elemento.textContent.trim() === 'Tabla de procesos') {
            elemento.parentElement.style.display = 'none';
            break;
        }
    }
}

export function mostrarTablaProcesos() {
    const elementos = document.querySelectorAll('section.card h3');
    for (const elemento of elementos) {
        if (elemento.textContent.trim() === 'Tabla de procesos') {
            elemento.parentElement.style.display = 'block';
            break;
        }
    }
}

export function ocultarSeccionDescarga() {
    const descargaSection = $('.download-section');
    if (descargaSection) descargaSection.style.display = 'none';
}

export function mostrarSeccionDescarga() {
    const descargaSection = $('.download-section');
    if (descargaSection) descargaSection.style.display = 'block';
}

export function mostrarVisualizacionMemoria() {
    const seccion = $('#memory-visualization');
    if (seccion) seccion.style.display = 'block';
}

export function ocultarVisualizacionMemoria() {
    const seccion = $('#memory-visualization');
    if (seccion) seccion.style.display = 'none';
}

export function habilitarBotonContinuar(elemento = null) {
    const boton = elemento || $('#puedeSeguir');
    if (!boton) return;

    boton.disabled = false;
    boton.textContent = 'Continuar';
}

export function deshabilitarBotonContinuar(elemento = null) {
    const boton = elemento || $('#puedeSeguir');
    if (!boton) return;

    boton.disabled = true;
    boton.textContent = 'Cargar archivo válido primero';
}

export function mostrarSeccionLog() {
    const section = $('#eventLog');
    if (section) section.style.display = 'block';
}

export function mostrarEstadoArchivo(mensaje, tipo, inputArchivo = null) {
    const elementoDestino = inputArchivo ?? document.querySelector('#file');

    if (!elementoDestino) {
        console.error("No se pudo encontrar el elemento file para mostrar el estado");
        return;
    }

    let indicador = document.querySelector('.file-status');
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.className = 'file-status';
        elementoDestino.appendChild(indicador);
    }
    indicador.textContent = mensaje;
    indicador.className = `file-status ` + tipo;
}

export function ocultarTodasLasSecciones() {
    ocultarInterfazPrincipal();
    ocultarSeccionResultados();
    ocultarVisualizacionMemoria();
}

export function ocultarSeccionesSimulacion() {
    ocultarSeccionResultados();
    ocultarTablaProcesos();
    ocultarSeccionDescarga();
    ocultarVisualizacionMemoria();
}

export function mostrarSeccionesSimulacion() {
    mostrarTablaProcesos();
    mostrarSeccionDescarga();
    mostrarSeccionResultados();
    mostrarSeccionLog();
    mostrarVisualizacionMemoria();
}