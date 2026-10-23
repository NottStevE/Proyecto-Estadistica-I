// Cálculo de Frecuencias para Datos Agrupados (Módulo 3)
function calcularTablaFrecuencias(datos, intervalosInfo) {
    const { k, amplitud, xmin } = intervalosInfo;
    let tablaFrecuencias = [];
    let limiteInferior = xmin;
    
    let F_acumulada = 0;
    let H_acumulada = 0;
    const n = datos.length;

    for (let i = 0; i < k; i++) {
        let limiteSuperior = limiteInferior + amplitud;
        
        // Marca de clase (xi) = (L_inf + L_sup) / 2
        let marcaClase = (limiteInferior + limiteSuperior) / 2;

        // Conteo de frecuencia absoluta (fi)
        // El último intervalo incluye al valor máximo exacto
        let fi = datos.filter(val => {
            if (i === k - 1) {
                return val >= limiteInferior && val <= limiteSuperior;
            }
            return val >= limiteInferior && val < limiteSuperior;
        }).length;

        F_acumulada += fi;
        
        // Frecuencia relativa (hi) = fi / n
        let hi = fi / n;
        H_acumulada += hi;

        tablaFrecuencias.push({
            clase: i + 1,
            limiteInferior: Number(limiteInferior.toFixed(2)),
            limiteSuperior: Number(limiteSuperior.toFixed(2)),
            marcaClase: Number(marcaClase.toFixed(2)),
            fi,
            F_acumulada,
            hi: Number(hi.toFixed(4)),
            Hi: Number(H_acumulada.toFixed(4))
        });

        limiteInferior = limiteSuperior;
    }

    return tablaFrecuencias;
}

module.exports = { calcularTablaFrecuencias };