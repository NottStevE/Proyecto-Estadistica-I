import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [datos, setDatos] = useState('12, 15, 18, 20, 22, 24, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 42, 45, 47, 50');
  const [intervalosK, setIntervalosK] = useState('5');
  const [criterioAmplitud, setCriterioAmplitud] = useState('ceil');
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  // Cargar historial al iniciar la app
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/historial');
      setHistorial(res.data);
    } catch (err) {
      console.error('No se pudo cargar el historial', err);
    }
  };

  const analizarDatos = async () => {
    try {
      setError('');
      const arrayDatos = datos.split(/[\s,;]+/).filter(Boolean).map(Number);
      
      const payload = {
        datos: arrayDatos,
        k: intervalosK ? Number(intervalosK) : undefined,
        criterio: criterioAmplitud
      };

      const res = await axios.post('http://localhost:4000/api/analizar', payload);
      setResultado(res.data);
      cargarHistorial(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al conectar con el servidor.');
    }
  };

  const seleccionarDelHistorial = (item) => {
    setDatos(item.datosOriginales.join(', '));
    setIntervalosK(item.k || '5');
    setCriterioAmplitud(item.criterio || 'ceil');
    setResultado({
      resumen: item.resumen,
      metricas: item.metricas,
      tablaFrecuencias: item.tablaFrecuencias
    });
  };

  const limpiar = () => {
    setDatos('');
    setIntervalosK('5');
    setCriterioAmplitud('ceil');
    setResultado(null);
    setError('');
  };

  const maxFi = resultado ? Math.max(...resultado.tablaFrecuencias.map(row => row.fi), 1) : 1;

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">▥</div>
          <div>
            <small>Universidad Mariano Gálvez de Guatemala</small>
            <strong>Estadística I · Laboratorio de análisis</strong>
          </div>
        </div>
        <div className="status">● Sistema Conectado con MongoDB</div>
      </header>

      <main className="wrap">
        <section className="hero">
          <div>
            <div className="eyebrow">Proyecto final · Datos agrupados</div>
            <h1>Sistema de análisis estadístico</h1>
            <p>Ingresa una serie de datos, organiza la información en intervalos y consulta la tabla de frecuencias, las medidas estadísticas y el historial desde un solo lugar.</p>
          </div>
          <div className="hero-icon">▤</div>
        </section>

        <div className="section-head">
          <div>
            <h2>Panel de análisis</h2>
            <p>Módulos principales del sistema con persistencia en Base de Datos.</p>
          </div>
          <span className="tag">REACT + EXPRESS + MONGODB</span>
        </div>

        {/* SECCIÓN PRINCIPAL: Ingreso a la izquierda, Resumen y Historial a la derecha */}
        <section className="grid">
          <div className="card">
            <h3>01. Ingreso de datos</h3>
            <p className="sub">Escribe o pega los valores numéricos separados por comas o espacios.</p>
            
            <label className="label">Datos de la muestra</label>
            <textarea 
              value={datos} 
              onChange={(e) => setDatos(e.target.value)}
              placeholder="Ejemplo: 12, 15, 18, 20..."
            />
            <div className="hint">Puedes pegar los datos desde Excel. Evita incluir letras o símbolos.</div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
              <div>
                <label className="label">Número de intervalos (k)</label>
                <input 
                  type="number" 
                  value={intervalosK} 
                  onChange={(e) => setIntervalosK(e.target.value)}
                  style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px'}}
                  min="1"
                />
              </div>
              <div>
                <label className="label">Criterio de amplitud</label>
                <select 
                  value={criterioAmplitud} 
                  onChange={(e) => setCriterioAmplitud(e.target.value)}
                  style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff'}}
                >
                  <option value="ceil">Redondear hacia arriba</option>
                  <option value="nearest">Redondear al más cercano</option>
                  <option value="exact">Valor exacto</option>
                </select>
              </div>
            </div>

            <div className="actions" style={{marginTop: '20px'}}>
              <button className="btn primary" onClick={analizarDatos}>↗ Generar análisis</button>
              <button className="btn secondary" onClick={limpiar}>Limpiar datos</button>
            </div>

            {error && <div className="notice" style={{background: '#ffe8e8', borderColor: '#f29b9b', color: '#771b1b', marginTop: '15px'}}>{error}</div>}
          </div>

          {/* COLUMNA DERECHA: Resumen de datos + Historial */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div className="card" style={{margin: 0}}>
              <h3>Resumen de los datos</h3>
              <p className="sub">Indicadores generales calculados por el motor.</p>
              <div className="settings">
                <div className="mini-stat"><span>Total de datos (N)</span><strong>{resultado ? resultado.resumen.totalDatos : '—'}</strong></div>
                <div className="mini-stat"><span>Valor mínimo</span><strong>{resultado ? resultado.resumen.minimo : '—'}</strong></div>
                <div className="mini-stat"><span>Valor máximo</span><strong>{resultado ? resultado.resumen.maximo : '—'}</strong></div>
                <div className="mini-stat"><span>Rango (R)</span><strong>{resultado ? resultado.resumen.rango : '—'}</strong></div>
              </div>
            </div>

            <div className="card" style={{margin: 0}}>
              <h3>Historial de análisis guardados</h3>
              <p className="sub">Haz clic en cualquier registro anterior para recuperarlo.</p>
              <div style={{maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px'}}>
                {historial.length > 0 ? (
                  historial.map((item, index) => (
                    <div 
                      key={item._id || index} 
                      onClick={() => seleccionarDelHistorial(item)}
                      style={{padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e293b'}}>
                        <span>N = {item.resumen.totalDatos} datos</span>
                        <span style={{color: '#64748b', fontSize: '11px'}}>{new Date(item.fecha).toLocaleTimeString()}</span>
                      </div>
                      <div style={{color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px'}}>
                        {item.datosOriginales.join(', ')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{color: '#64748b', textAlign: 'center', padding: '15px', fontSize: '13px'}}>No hay análisis guardados aún.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 02. TABLA DE FRECUENCIAS */}
        <div className="section-head">
          <div>
            <h2>02. Tabla de distribución de frecuencias</h2>
            <p>Intervalos generados según los parámetros configurados.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Clase</th>
                <th>Límite inferior</th>
                <th>Límite superior</th>
                <th>Marca de clase (xi)</th>
                <th>Frecuencia (fi)</th>
                <th>Acumulada (Fi)</th>
                <th>Relativa (hi)</th>
              </tr>
            </thead>
            <tbody>
              {resultado ? (
                resultado.tablaFrecuencias.map((row) => (
                  <tr key={row.clase}>
                    <td>{row.clase}</td>
                    <td>{row.limiteInferior}</td>
                    <td>{row.limiteSuperior}</td>
                    <td>{row.marcaClase}</td>
                    <td>{row.fi}</td>
                    <td>{row.F_acumulada}</td>
                    <td>{row.hi}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', color: '#64748b'}}>Haz clic en "Generar análisis" o selecciona uno del historial.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 03. MEDIDAS ESTADÍSTICAS */}
        <div className="section-head">
          <div>
            <h2>03. Medidas estadísticas</h2>
            <p>Resultados de tendencia central, dispersión y forma.</p>
          </div>
          <span className="tag">12 FÓRMULAS</span>
        </div>

        <div className="metric-grid">
          <div className="metric">
            <div className="name">Media agrupada (μ)</div>
            <div className="value">{resultado ? resultado.metricas.mediaAgrupada : '—'}</div>
            <div className="note">Promedio aproximado</div>
          </div>
          <div className="metric">
            <div className="name">Varianza (σ²)</div>
            <div className="value">{resultado ? resultado.metricas.varianza : '—'}</div>
            <div className="note">Dispersión de los datos</div>
          </div>
          <div className="metric">
            <div className="name">Desviación estándar (σ)</div>
            <div className="value">{resultado ? resultado.metricas.desviacionEstandar : '—'}</div>
            <div className="note">Dispersión promedio</div>
          </div>
          <div className="metric">
            <div className="name">Asimetría (g₁)</div>
            <div className="value">{resultado ? resultado.metricas.asimetria : '—'}</div>
            <div className="note">Forma de la distribución</div>
          </div>
        </div>

        {/* 04. HISTOGRAMA DE FRECUENCIAS */}
        <div className="section-head">
          <div>
            <h2>04. Histograma de frecuencias</h2>
            <p>Representación gráfica de la frecuencia en cada intervalo.</p>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card">
            <h3>Distribución por intervalos</h3>
            <p className="sub">Gráfico de barras dinámico generado a partir de la tabla.</p>
            <div className="chart">
              {resultado ? (
                resultado.tablaFrecuencias.map((row) => (
                  <div className="bar-col" key={row.clase}>
                    <span className="bar-num">{row.fi}</span>
                    <div 
                      className="bar" 
                      style={{ height: `${(row.fi / maxFi) * 85}%` }}
                    ></div>
                    <span className="bar-label">Clase {row.clase}</span>
                  </div>
                ))
              ) : (
                <div style={{width: '100%', textAlign: 'center', color: '#64748b', alignSelf: 'center'}}>
                  Genera el análisis para ver el histograma
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Fórmulas incluidas</h3>
            <p className="sub">Listado de las doce operaciones requeridas en clase.</p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px'}}>
              <div>01 · Rango</div>
              <div>02 · Regla de Sturges</div>
              <div>03 · Amplitud</div>
              <div>04 · Marca de clase</div>
              <div>05 · Frecuencia relativa</div>
              <div>06 · Frecuencia acumulada</div>
              <div>07 · Media agrupada</div>
              <div>08 · Varianza poblacional</div>
              <div>09 · Desviación estándar</div>
              <div>10 · Asimetría</div>
              <div>11 · Curtosis</div>
              <div>12 · Exceso de curtosis</div>
            </div>
            <div className="notice">
              Los resultados finales deberán verificarse con las fórmulas poblacionales indicadas por el docente.
            </div>
          </div>
        </div>

        {/* 05. DETALLE DE FÓRMULAS */}
        <div className="section-head">
          <div>
            <h2>05. Detalle de fórmulas</h2>
            <p>Referencia visual para que cada medida tenga su fórmula identificada.</p>
          </div>
        </div>

        <div className="formula-grid">
          <div className="formula">
            <div className="num">FÓRMULA 01</div>
            <h4>Rango</h4>
            <code>R = Xmáx − Xmín</code>
            <p>Diferencia entre el valor mayor y el menor.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 02</div>
            <h4>Regla de Sturges</h4>
            <code>k = 1 + 3.322 log₁₀(N)</code>
            <p>Estima la cantidad de clases.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 03</div>
            <h4>Amplitud</h4>
            <code>A = R / k</code>
            <p>Ancho de cada intervalo.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 04</div>
            <h4>Marca de clase</h4>
            <code>xi = (LIi + LSi) / 2</code>
            <p>Punto medio del intervalo.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 05</div>
            <h4>Frecuencia relativa</h4>
            <code>hi = fi / N</code>
            <p>Proporción de datos por clase.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 06</div>
            <h4>Frecuencia acumulada</h4>
            <code>Fi = Σ fj</code>
            <p>Suma de frecuencias hasta la clase i.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 07</div>
            <h4>Media agrupada</h4>
            <code>μ ≈ Σ(fi · xi) / N</code>
            <p>Promedio estimado con marcas de clase.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 08</div>
            <h4>Varianza poblacional</h4>
            <code>σ² ≈ Σ[fi(xi − μ)²] / N</code>
            <p>Mide la dispersión respecto a la media.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 09</div>
            <h4>Desviación estándar</h4>
            <code>σ = √(σ²)</code>
            <p>Raíz cuadrada de la varianza.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 10</div>
            <h4>Asimetría poblacional</h4>
            <code>g₁ ≈ Σ[fi(xi − μ)³] / (Nσ³)</code>
            <p>Describe el sesgo de la distribución.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 11</div>
            <h4>Curtosis poblacional</h4>
            <code>K ≈ Σ[fi(xi − μ)⁴] / (Nσ⁴)</code>
            <p>Describe la concentración de los datos.</p>
          </div>
          <div className="formula">
            <div className="num">FÓRMULA 12</div>
            <h4>Exceso de curtosis</h4>
            <code>Ke = K − 3</code>
            <p>Compara la curtosis con la distribución normal.</p>
          </div>
        </div>

        <footer className="footer">
          Proyecto final · Estadística I · Universidad Mariano Gálvez de Guatemala<br/>
          Sistema desarrollado con React, Node.js y Express.
        </footer>
      </main>
    </div>
  );
}

export default App;