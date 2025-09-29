export function buscarIndiceBloque(bloques, tamaño, estrategia, NextFitPos = 0) {
    if (estrategia === 'first') {
        for (let i = 0; i < bloques.length; i++) {
            if (bloques[i].free && bloques[i].size >= tamaño) return i;
        }
        return -1;
    }

    if (estrategia === 'next') {
        for (let k = 0; k < bloques.length; k++) {
            const i = (NextFitPos + k) % bloques.length;
            if (bloques[i].free && bloques[i].size >= tamaño) return i;
        }
        return -1;
    }

    if (estrategia === 'best') {
        let mejor = -1, bestSize = Infinity;
        for (let i = 0; i < bloques.length; i++) {
            if (bloques[i].free && bloques[i].size >= tamaño && bloques[i].size < bestSize) {
                mejor = i;
                bestSize = bloques[i].size;
            }
        }
        return mejor;
    }

    if (estrategia === 'worst') {
        let peor = -1, worstSize = -1;
        for (let i = 0; i < bloques.length; i++) {
            if (bloques[i].free && bloques[i].size >= tamaño && bloques[i].size > worstSize) {
                peor = i;
                worstSize = bloques[i].size;
            }
        }
        return peor;
    }

    return -1;
}

