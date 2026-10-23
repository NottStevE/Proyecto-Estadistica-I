// Cálculo de Asimetría, Curtosis y Exceso (Módulo 5)
function calcularAsimetriaYCurtosis(tablaFrecuencias, n, media, desviacionEstandar) {
    if (desviacionEstandar === 0) {
        return { asimetria: 0, curtosis: 0, excesoCurtosis: 0 };
    }

    let sumaAsimetria = 0;
    let sumaCurtosis = 0;

    tablaFrecuencias.forEach(row => {
        let x = row.marcaClase;
        let fi = row.fi;

        // Estandarizado (x - media) / desviacion
        let z = (x - media) / desviacionEstandar;

        // Sumatoria para Asimetría: fi * ((x - media) / s)^3
        sumaAsimetria += fi * Math.pow(z, 3);

        // Sumatoria para Curtosis: fi * ((x - media) / s)^4
        sumaCurtosis += fi * Math.pow(z, 4);
    });

    // Asimetría poblacional (g1)
    let asimetria = (sumaAsimetria / n);

    // Curtosis (K)
    let curtosis = (sumaCurtosis / n);

    // Exceso de Curtosis (Ke = K - 3)
    let excesoCurtosis = curtosis - 3;

    return {
        asimetria: Number(asimetria.toFixed(4)),
        curtosis: Number(curtosis.toFixed(4)),
        excesoCurtosis: Number(excesoCurtosis.toFixed(4))
    };
}

module.exports = { calcularAsimetriaYCurtosis };