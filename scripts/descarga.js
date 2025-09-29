let eventosLog = [];

export function agregarEventoLog(evento, tiempoSimulacion) {
    const linea = `t=${tiempoSimulacion}: ${evento}`;
    eventosLog.push(linea);
}

export function logConfiguracionInicial(memoriaTotal, memoriaSO, estrategia, tiemposConfig, procesos) {
    eventosLog.push("=".repeat(60));
    eventosLog.push("CONFIGURACIÓN DE LA SIMULACIÓN");
    eventosLog.push("=".repeat(60));
    eventosLog.push(`Memoria total: ${memoriaTotal + memoriaSO} KB`);
    eventosLog.push(`Memoria SO: ${memoriaSO} KB`);
    eventosLog.push(`Memoria usuario: ${memoriaTotal} KB`);
    eventosLog.push(`Estrategia: ${estrategia}`);

    eventosLog.push(`\nTIEMPOS CONFIGURADOS:`);
    eventosLog.push(`- Selección partición: ${tiemposConfig?.tiempoSeleccionParticion || 0} uds`);
    eventosLog.push(`- Carga promedio: ${tiemposConfig?.tiempoCargaPromedio || 0} uds`);
    eventosLog.push(`- Liberación partición: ${tiemposConfig?.tiempoLiberacionParticion || 0} uds`);

    eventosLog.push(`\nPROCESOS A EJECUTAR:`);
    procesos.forEach((p, i) => {
        eventosLog.push(`${i + 1}. ${p.nombre} | Memoria: ${p.memoria_requerida}K | Duración: ${p.duracion} | Arribo: t=${p.tiempo_arribo}`);
    });

    eventosLog.push("=".repeat(60));
    eventosLog.push("");
}

export function logEstadoParticiones(particiones, tiempoSimulacion) {
    eventosLog.push(`\n--- Estado de Particiones en t=${tiempoSimulacion} ---`);
    particiones.forEach((p, i) => {
        const base = p.base ?? p.start ?? 0;
        const tamaño = p.tamaño ?? p.size ?? 0;
        let ocupante;
        if (p.esSO) ocupante = "SO";
        else if (p.proceso != null) ocupante = p.proceso;
        else if (p.jIdx != null && p.jIdx >= 0) ocupante = `P${p.jIdx + 1}`;
        else ocupante = "???";

        const estado = p.free ? "Libre" : `Ocupada por ${ocupante}`;
        eventosLog.push(`Partición ${i} | Base: ${base} | Tamaño: ${tamaño} | Estado: ${estado}`);
    });
    eventosLog.push("-------------------------------------------");
}

export function logResumenResultados(estrategia, resultado) {
    eventosLog.push("\n" + "=".repeat(50));
    eventosLog.push("RESULTADOS DE LA SIMULACIÓN");
    eventosLog.push("=".repeat(50));

    eventosLog.push(`Estrategia: ${estrategia}`);
    eventosLog.push(`Tiempo total de simulación: ${resultado.tiempoTotal} unidades`);
    eventosLog.push(`Memoria Total: ${resultado.memoriaUsuario + resultado.memSo} KB`);
    eventosLog.push(`Retorno promedio: ${resultado.promedioRetorno.toFixed(2)} unidades`);
    eventosLog.push(`Memoria SO: ${resultado.memSo} KB`);
    eventosLog.push(`Fragmentación externa: ${resultado.fragmentacionExterna}`);
    eventosLog.push(`Memoria Usuarios: ${resultado.memoriaUsuario} KB`);

    eventosLog.push("\nTIEMPOS ACUMULADOS:");
    eventosLog.push(`Total tiempo selección: ${resultado.tiemposAcumulados.totalSeleccion} uds`);
    eventosLog.push(`Total tiempo carga: ${resultado.tiemposAcumulados.totalCarga} uds`);
    eventosLog.push(`Total tiempo liberación: ${resultado.tiemposAcumulados.totalLiberacion} uds`);

    eventosLog.push("=".repeat(50));
}

export function descargarLog(formato) {
    if (!formato) {
        alert("Seleccione un formato");
        return;
    }

    let blob, url, a;
    switch (formato) {
        case "txt":
            blob = new Blob([eventosLog.join("\n")], { type: "text/plain" });
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "simulacion_log.txt";
            a.click();
            URL.revokeObjectURL(url);
            break;

        case "json":
            const jsonData = JSON.stringify(eventosLog, null, 2);
            blob = new Blob([jsonData], { type: "application/json" });
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "simulacion_log.json";
            a.click();
            URL.revokeObjectURL(url);
            break;
        case "pdf":
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (!window.jspdf) {
                alert("jsPDF no está cargado");
                return;
            }

            doc.setFontSize(14);
            doc.text("Simulación de Memoria", 14, 15);

            const rows = eventosLog.map((linea) => [linea]);

            doc.autoTable({
                body: rows,
                startY: 15,
                styles: { fontSize: 10, cellPadding: 2 },
            });

            const canvas = document.getElementById("memCanvas");
            if (canvas) {
                const imgData = canvas.toDataURL("image/png");
                let finalY = doc.lastAutoTable.finalY || 30;
                if (finalY + 90 > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    finalY = 20;
                }
                doc.addImage(imgData, "PNG", 14, finalY + 10, 180, 90);
            }

            doc.save("simulacion_log.pdf");
            break;
    }
}

export function limpiarLog() {
    eventosLog = [];
}
