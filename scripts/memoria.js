function fusionarLibresAdyacentes(bloques) {
    for (let i = 0; i < bloques.length - 1; i++) {
        const bloqueActual = bloques[i];
        const bloqueSiguiente = bloques[i + 1];
        if (bloqueActual.free && bloqueSiguiente.free) {
            bloqueActual.size += bloqueSiguiente.size;
            bloques.splice(i + 1, 1); //elimina siguiente bloque del array
            i--;
        }
    }
}

export function asignarBloque(bloques, indiceBloque, memoriaProceso, idxProceso) {
    const blk = bloques[indiceBloque];

    if (blk.esSO) {
        throw new Error("Error: Intentando asignar proceso sobre el bloque del Sistema Operativo");
    }

    if (blk.size === memoriaProceso) {
        blk.free = false;
        blk.jIdx = idxProceso;
    } else {
        const asignado = {
            start: blk.start,
            size: memoriaProceso,
            free: false,
            jIdx: idxProceso
        };
        const resto = {//memoria sobrante
            start: blk.start + memoriaProceso,
            size: blk.size - memoriaProceso,
            free: true,
            jIdx: null
        };
        bloques.splice(indiceBloque, 1, asignado, resto);//reemplazo bloque original, elimino 1, reemplazo 2
    }
}

export function liberarProceso(bloques, idxProceso) {
    const bq = bloques.findIndex(b => !b.free && b.jIdx === idxProceso);
    if (bq !== -1) {
        const bloque = bloques[bq];
        bloque.free = true;
        bloque.jIdx = null;
        fusionarLibresAdyacentes(bloques);
    }
}
