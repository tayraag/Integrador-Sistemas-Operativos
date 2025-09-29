const UI_CONFIG = {
    CANVAS: {
        WIDTH: 1000,
        HEIGHT: 600,
        MARGIN: 50,
        MIN_TEXT_WIDTH: 30,
        MIN_TEXT_HEIGHT: 15
    },

    GRID: {
        MIN_MEMORY_STEP: 10,
        MEMORY_DIVISIONS: 10,
        TIME_DIVISIONS: 15,
        MIN_TIME_STEP: 1
    },

    LOG: {
        MAX_ENTRIES: 500
    },

    COLORS: [
        "#F6BD60", "#F5CAC3", "#84A59D", "#F28482",
        "#F59D9B", "#A8D5E2", "#F9C784", "#90BE6D",
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
    ]
};

export function mostrarEstadisticas(resultados, estrategia, elementoEstadisticas) {
    const memoriaTotal = resultados.memoriaUsuario + resultados.memSo;
    const memoriaUsuarios = resultados.memoriaUsuario;
    const memoriaSO = resultados.memSo;

    elementoEstadisticas.innerHTML = `
        <h3>Resultados</h3>
        <div class="results-container">
            <div class="results-main">
                <div class="results-list">
                    <div class="result-line"> 
                        <span class="result-label">Estrategia:</span>
                        <span class="result-value">${estrategia}</span>
                    </div>
                    <div class="result-line">
                        <span class="result-label">Memoria Total:</span>
                        <span class="result-value">${memoriaTotal} KB</span>
                    </div>
                    <div class="result-line">
                        <span class="result-label">Memoria SO:</span>
                        <span class="result-value">${memoriaSO} KB</span>
                    </div>
                    <div class="result-line">
                        <span class="result-label">Memoria Usuarios:</span>
                        <span class="result-value">${memoriaUsuarios} KB</span>
                    </div>
                </div>
                
                <div class="results-list">
                    <div class="result-line">
                        <span class="result-label">Tiempo total de simulación:</span>
                        <span class="result-value">${resultados.tiempoTotal} unidades</span>
                    </div>
                    <div class="result-line">
                        <span class="result-label">Retorno promedio:</span>
                        <span class="result-value">${resultados.promedioRetorno.toFixed(2)} unidades</span>
                    </div>
                    <div class="result-line">
                        <span class="result-label">Fragmentación externa:</span>
                        <span class="result-value">${resultados.fragmentacionExterna}</span>
                    </div>
                </div>
            </div>
                <h4>Tiempos Acumulados</h4>
                <div class="times-table">
                    <div class="time-item">
                        <span class="time-label">Total tiempo selección</span>
                        <span class="time-value">${resultados.tiemposAcumulados?.totalSeleccion || 0} uds</span>
                    </div>
                    <div class="time-item">
                        <span class="time-label">Total tiempo carga</span>
                        <span class="time-value">${resultados.tiemposAcumulados?.totalCarga || 0} uds</span>
                    </div>
                    <div class="time-item">
                        <span class="time-label">Total tiempo liberación</span>
                        <span class="time-value">${resultados.tiemposAcumulados?.totalLiberacion || 0} uds</span>
                    </div>
                </div>
        </div>
    `;
}

export function mostrarTablaProcesos(filas, cuerpoTablaProcesos) {
    cuerpoTablaProcesos.innerHTML = '';

    if (filas.length === 0) return;

    const tiempoInicio = filas[0].tiempo_arribo;

    for (const r of filas) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.memoria}</td>
      <td>${r.duracion}</td>
      <td>${r.arribo}</td>
      <td>${r.inicio ?? '-'}</td>
      <td>${r.fin ?? '-'}</td>
      <td>${r.retorno ?? '-'}</td>`;
        cuerpoTablaProcesos.appendChild(tr);
    }
}


export function agregarEventoLog(mensaje) {
    try {
        const logContainer = document.getElementById('logContainer');

        if (logContainer) {
            const li = document.createElement('li');
            li.innerHTML = mensaje;
            logContainer.appendChild(li);
            logContainer.scrollTop = 0;
            if (logContainer.children.length > UI_CONFIG.LOG.MAX_ENTRIES) {
                logContainer.removeChild(logContainer.firstChild);
            }
        }
    } catch (error) {
        console.log(`${mensaje}`);
    }
}

export function limpiarEventoLog() {
    try {
        const logContainer = document.getElementById('logContainer');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    } catch (error) {
        console.log('Error limpiando log del DOM');
    }
}

export function mostrarLineaTiempoMemoria(canvasId, procesos, memoriaTotal, tiempoTotal, memoriaSO = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = UI_CONFIG.CANVAS.WIDTH;
    canvas.height = UI_CONFIG.CANVAS.HEIGHT;

    const margen = UI_CONFIG.CANVAS.MARGIN;
    const ancho = canvas.width - margen * 2;
    const alto = canvas.height - margen * 2;

    const procesosEjecutados = procesos.filter(p => p.inicio != null && p.fin != null && p.memoria > 0);

    const maxFin = Math.max(...procesosEjecutados.map(p => p.fin), tiempoTotal);
    const escalaX = ancho / Math.max(maxFin, 1);
    const escalaY = alto / memoriaTotal;

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margen, margen);
    ctx.lineTo(margen, margen + alto);
    ctx.lineTo(margen + ancho, margen + alto);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.font = "10px Arial";
    const stepMemoria = Math.max(UI_CONFIG.GRID.MIN_MEMORY_STEP, Math.floor(memoriaTotal / UI_CONFIG.GRID.MEMORY_DIVISIONS));

    for (let m = 0; m <= memoriaTotal; m += stepMemoria) {
        const y = margen + alto - m * escalaY;
        ctx.fillText(`${m}K`, margen - 5, y + 3);
        if (m > 0) {
            ctx.strokeStyle = "#ddd";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margen, y);
            ctx.lineTo(margen + ancho, y);
            ctx.stroke();
        }
    }

    ctx.textAlign = "center";
    const stepTiempo = Math.max(UI_CONFIG.GRID.MIN_TIME_STEP, Math.floor(maxFin / UI_CONFIG.GRID.TIME_DIVISIONS));

    for (let t = 0; t <= maxFin; t += stepTiempo) {
        const x = margen + t * escalaX;
        ctx.fillText(t.toString(), x, margen + alto + 15);
        if (t > 0) {
            ctx.strokeStyle = "#ddd";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, margen);
            ctx.lineTo(x, margen + alto);
            ctx.stroke();
        }
    }

    if (memoriaSO > 0) {
        const alturaSO = memoriaSO * escalaY;
        const ySO = margen + alto - alturaSO;

        ctx.fillStyle = "#666";
        ctx.fillRect(margen, ySO, ancho, alturaSO);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(margen, ySO, ancho, alturaSO);

        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SO", margen + ancho / 2, ySO + alturaSO / 2);
    }

    procesosEjecutados.forEach((proceso, index) => {
        const xInicio = margen + proceso.inicio * escalaX;
        const xFin = margen + proceso.fin * escalaX;
        const anchoBloque = Math.max(xFin - xInicio, 2);

        const yTop = margen + alto - (proceso.base + proceso.memoria) * escalaY;
        const alturaBloque = proceso.memoria * escalaY;

        if (anchoBloque > 0 && alturaBloque > 0) {
            ctx.fillStyle = UI_CONFIG.COLORS[index % UI_CONFIG.COLORS.length];
            ctx.fillRect(xInicio, yTop, anchoBloque, alturaBloque);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(xInicio, yTop, anchoBloque, alturaBloque);

            if (anchoBloque > UI_CONFIG.CANVAS.MIN_TEXT_WIDTH && alturaBloque > UI_CONFIG.CANVAS.MIN_TEXT_HEIGHT) {
                ctx.fillStyle = "black";
                ctx.font = "10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(proceso.nombre, xInicio + anchoBloque / 2, yTop + alturaBloque / 2);
            }
        }
    });

    ctx.fillStyle = "var(--c5)";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Visualización de la Memoria", canvas.width / 2, 35);


    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "12px Arial";
    ctx.fillText("Tiempo", margen + ancho / 2, margen + alto + 30);

    ctx.save();
    ctx.translate(15, margen + alto / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Memoria (K)", 0, 0);
    ctx.restore();
}