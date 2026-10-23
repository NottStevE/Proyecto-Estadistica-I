const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONEXIÓN A MONGODB ---
mongoose.connect('mongodb://127.0.0.1:27017/estadistica_db')
  .then(() => console.log('Conectado a MongoDB exitosamente'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// --- 2. MODELO DE MONGOOSE PARA EL HISTORIAL ---
const AnalisisSchema = new mongoose.Schema({
  datosOriginales: [Number],
  k: Number,
  criterio: String,
  resumen: Object,
  metricas: Object,
  tablaFrecuencias: Array,
  fecha: { type: Date, default: Date.now }
});

const Analisis = mongoose.model('Analisis', AnalisisSchema);
// --- RUTA PARA OBTENER EL HISTORIAL ---
app.get('/api/historial', async (req, res) => {
  try {
    const historial = await Analisis.find().sort({ fecha: -1 }).limit(10); // Trae los últimos 10
    res.json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
});

// --- 3. RUTA DE ANÁLISIS ESTADÍSTICO ---
app.post('/api/analizar', async (req, res) => {
  try {
    const { datos, k: kCustom, criterio } = req.body;

    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      return res.status(400).json({ error: 'Por favor ingresa una lista válida de números.' });
    }

    const N = datos.length;
    const min = Math.min(...datos);
    const max = Math.max(...datos);
    const rango = max - min;

    // Cálculo de k (intervalos): si el usuario envió uno válido, se usa; si no, Regla de Sturges
    let k = kCustom && kCustom > 0 ? Number(kCustom) : Math.round(1 + 3.322 * Math.log10(N));
    if (k < 1) k = 1;

    // Amplitud inicial
    const amplitudRaw = rango / k;
    let amplitud = amplitudRaw;

    // Aplicar criterio de amplitud
    if (criterio === 'ceil') {
      amplitud = Math.ceil(amplitudRaw);
      if (amplitud === 0) amplitud = 1; // Evitar amplitud 0 si los datos son muy cercanos
    } else if (criterio === 'nearest') {
      amplitud = Math.round(amplitudRaw);
      if (amplitud === 0) amplitud = 1;
    } // Si es 'exact', se queda con amplitudRaw

    // Construcción de intervalos y tabla de frecuencias
    let tablaFrecuencias = [];
    let limiteInferiorActual = min;
    let F_acumulada = 0;

    let sumaFiXi = 0;
    let marcasClaseArray = [];
    let frecuenciasArray = [];

    for (let i = 1; i <= k; i++) {
      let limiteSuperiorActual = limiteInferiorActual + amplitud;
      
      // Asegurar que el último intervalo cubra el valor máximo
      if (i === k && limiteSuperiorActual < max) {
        limiteSuperiorActual = max;
      }

      // Marca de clase (xi)
      const marcaClase = Number(((limiteInferiorActual + limiteSuperiorActual) / 2).toFixed(4));
      
      // Frecuencia (fi): contar cuántos datos caen en el intervalo
      // [LI, LS) excepto en la última clase que es [LI, LS]
      const fi = datos.filter(val => {
        if (i === k) {
          return val >= limiteInferiorActual && val <= limiteSuperiorActual;
        } else {
          return val >= limiteInferiorActual && val < limiteSuperiorActual;
        }
      }).length;

      F_acumulada += fi;
      const hi = Number((fi / N).toFixed(4));

      sumaFiXi += fi * marcaClase;
      marcasClaseArray.push(marcaClase);
      frecuenciasArray.push(fi);

      tablaFrecuencias.push({
        clase: i,
        limiteInferior: Number(limiteInferiorActual.toFixed(2)),
        limiteSuperior: Number(limiteSuperiorActual.toFixed(2)),
        marcaClase,
        fi,
        F_acumulada,
        hi
      });

      limiteInferiorActual = limiteSuperiorActual;
    }

    // --- 4. CÁLCULO DE MÉTRICAS ESTADÍSTICAS ---
    // Media agrupada (μ)
    const mediaAgrupada = Number((sumaFiXi / N).toFixed(4));

    // Varianza poblacional (σ²) = Σ[fi * (xi - μ)²] / N
    let sumaVarianza = 0;
    for (let i = 0; i < k; i++) {
      sumaVarianza += frecuenciasArray[i] * Math.pow(marcasClaseArray[i] - mediaAgrupada, 2);
    }
    const varianza = Number((sumaVarianza / N).toFixed(4));

    // Desviación estándar (σ)
    const desviacionEstandar = Number(Math.sqrt(varianza).toFixed(4));

    // Asimetría poblacional (g₁) = Σ[fi * (xi - μ)³] / (N * σ³)
    let sumaAsimetria = 0;
    if (desviacionEstandar > 0) {
      for (let i = 0; i < k; i++) {
        sumaAsimetria += frecuenciasArray[i] * Math.pow(marcasClaseArray[i] - mediaAgrupada, 3);
      }
    }
    const asimetria = desviacionEstandar > 0 ? Number((sumaAsimetria / (N * Math.pow(desviacionEstandar, 3))).toFixed(4)) : 0;

    // Curtosis poblacional (K) y Exceso
    let sumaCurtosis = 0;
    if (desviacionEstandar > 0) {
      for (let i = 0; i < k; i++) {
        sumaCurtosis += frecuenciasArray[i] * Math.pow(marcasClaseArray[i] - mediaAgrupada, 4);
      }
    }
    const curtosisVal = desviacionEstandar > 0 ? Number((sumaCurtosis / (N * Math.pow(desviacionEstandar, 4))).toFixed(4)) : 0;
    const excesoCurtosis = Number((curtosisVal - 3).toFixed(4));

    const resultadoFinal = {
      resumen: {
        totalDatos: N,
        minimo: min,
        maximo: max,
        rango: Number(rango.toFixed(2)),
        kCalculado: k,
        amplitudFinal: Number(amplitud.toFixed(4))
      },
      metricas: {
        mediaAgrupada,
        varianza,
        desviacionEstandar,
        asimetria,
        curtosis: curtosisVal,
        excesoCurtosis
      },
      tablaFrecuencias
    };

    // Guardar en MongoDB
    const nuevoAnalisis = new Analisis({
      datosOriginales: datos,
      k,
      criterio,
      ...resultadoFinal
    });
    await nuevoAnalisis.save();

    res.json(resultadoFinal);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno en el servidor al procesar los datos.' });
  }
});

// --- 5. LEVANTAR EL SERVIDOR ---
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});