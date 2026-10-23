const { validarYLimpiarDatos } = require('../utils/validate');
const { calcularIntervalos } = require('../utils/intervals');
const { calcularTablaFrecuencias } = require('../utils/frequencyTable');
const { calcularTendenciaYDispersion } = require('../utils/centralTendency');
const { calcularAsimetriaYCurtosis } = require('../utils/shapeMetrics');

const procesarAnalisisEstadistico = (req, res) => {
    try {
        const { datos } = req.body; // Se espera un array o string con los números

        // Módulo 1: Validación
        const datosLimpios = validarYLimpiarDatos(datos);

        // Módulo 2: Intervalos y Sturges
        const infoIntervalos = calcularIntervalos(datosLimpios);

        // Módulo 3: Tabla de Frecuencias
        const tablaFrecuencias = calcularTablaFrecuencias(datosLimpios, infoIntervalos);

        // Módulo 4: Tendencia Central y Dispersión
        const medidasCentrales = calcularTendenciaYDispersion(tablaFrecuencias, infoIntervalos.n);

        // Módulo 5: Asimetría y Curtosis
        const medidasForma = calcularAsimetriaYCurtosis(
            tablaFrecuencias, 
            infoIntervalos.n, 
            medidasCentrales.mediaAgrupada, 
            medidasCentrales.desviacionEstandar
        );

        // Respuesta consolidada con las métricas requeridas
        res.status(200).json({
            success: true,
            mensaje: "Análisis estadístico procesado con éxito",
            resumen: {
                totalDatos: infoIntervalos.n,
                minimo: infoIntervalos.xmin,
                maximo: infoIntervalos.xmax,
                rango: infoIntervalos.rango,
                clasesSturges: infoIntervalos.k,
                amplitud: infoIntervalos.amplitud
            },
            tablaFrecuencias,
            metricas: {
                ...medidasCentrales,
                ...medidasForma
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { procesarAnalisisEstadistico };