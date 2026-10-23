// Cálculo de Intervalos y Regla de Sturges (Módulo 2)
function calcularIntervalos(datos) {
    const n = datos.length;
    const ordenados = [...datos].sort((a, b) => a - b);
    
    const xmin = ordenados[0];
    const xmax = ordenados[n - 1];
    
    const rango = xmax - xmin;
    const sturges = 1 + 3.322 * Math.log10(n);
    const k = Math.round(sturges);
    const amplitud = rango / k;

    return {
        n,
        xmin,
        xmax,
        rango,
        sturgesExacto: sturges,
        k,
        amplitud: Math.ceil(amplitud)
    };
}

module.exports = { calcularIntervalos };