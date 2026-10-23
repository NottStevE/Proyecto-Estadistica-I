// Cálculo de Tendencia Central y Dispersión (Módulo 4)
function calcularTendenciaYDispersion(tablaFrecuencias, n) {
    // 1. Media Agrupada (mu) = Sumatoria(fi * xi) / n
    let sumaFiXi = tablaFrecuencias.reduce((acc, row) => acc + (row.fi * row.marcaClase), 0);
    let mediaAgrupada = sumaFiXi / n;

    // 2. Varianza (sigma^2) = Sumatoria(fi * (xi - media)^2) / n (o n-1 si es muestral, usaremos poblacional estándar por defecto)
    let sumaVarianza = tablaFrecuencias.reduce((acc, row) => {
        let desviacionCuadrada = Math.pow(row.marcaClase - mediaAgrupada, 2);
        return acc + (row.fi * desviacionCuadrada);
    }, 0);

    let varianza = sumaVarianza / n;

    // 3. Desviación Estándar (sigma) = Raíz cuadrada de la varianza
    let desviacionEstandar = Math.sqrt(varianza);

    return {
        mediaAgrupada: Number(mediaAgrupada.toFixed(4)),
        varianza: Number(varianza.toFixed(4)),
        desviacionEstandar: Number(desviacionEstandar.toFixed(4))
    };
}

module.exports = { calcularTendenciaYDispersion };