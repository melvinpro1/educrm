import React, { useEffect, useState } from "react";
import "../recursos/estilos/Home.css";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { getDashboardStats } from "../api/dashboard";
import { getHistorialAcciones } from "../api/estudiantes";

// Colores institucionales para el gráfico
const COLORES = {
  "Cuarto Nivel": "#003ea5",  // Azul institucional
  "Quinto Nivel": "#ffc72d",  // Amarillo institucional
};

function Home() {
  const [stats, setStats] = useState({
    estudiantes_activos: 0,
    estudiantes_totales: 0,
    encargados_totales: 0,
    comunicaciones_enviadas: 0,
    correos_totales: 0,
    estudiantes_por_nivel: [],
  });
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const fecha = new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
    cargarHistorial();
  }, []);

  async function cargarEstadisticas() {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  }

  async function cargarHistorial() {
    const data = await getHistorialAcciones();
    setHistorial(data);
  }

  // Formatear datos para el gráfico
  const datosGrafico = stats.estudiantes_por_nivel.map((nivel) => ({
    nombre: nivel.nombre,
    valor: nivel.valor,
    color: COLORES[nivel.nombre] || "#6B7280",
  }));

  return (
    <div className="home">
      {/* Encabezado */}
      <header className="home-encabezado">
        <div>
          <h1 className="home-titulo">Panel Principal</h1>
          <p className="home-subtitulo">Sistema de Gestión CCSP</p>
        </div>
        <p className="home-fecha">{fecha}</p>
      </header>

      {loading ? (
        <div className="home-loading">
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Tarjetas */}
          <section className="home-tarjetas">
            <div className="home-tarjeta azul">
              <h3>Total de Estudiantes</h3>
              <p className="home-numero">{stats.estudiantes_totales}</p>
            </div>

            <div className="home-tarjeta verde">
              <h3>Encargados Registrados</h3>
              <p className="home-numero">{stats.encargados_totales}</p>
            </div>

            <div className="home-tarjeta morado">
              <h3>Comunicaciones Enviadas</h3>
              <p className="home-numero">{stats.comunicaciones_enviadas}</p>
            </div>

            <div className="home-tarjeta naranja">
              <h3>Correos Totales</h3>
              <p className="home-numero">{stats.correos_totales}</p>
            </div>
          </section>

          {/* Gráficos */}
          <section className="home-graficos">
            <div className="home-grafico">
              <h2>Distribución por Nivel Académico</h2>
              {datosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                     data={datosGrafico}
                      dataKey="valor"
                      nameKey="nombre"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      label={({ value }) => value}
                      labelLine={false}
                    >
                     {datosGrafico.map((nivel, i) => (
                        <Cell key={i} fill={nivel.color} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ color: '#374151', fontSize: '14px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="home-placeholder">
                  <span className="bi bi-exclamation-triangle"></span> No hay estudiantes registrados aún.
                </p>
              )}
            </div>

            <div className="home-grafico">
              <h2>Resumen de Actividad</h2>
              <div className="home-resumen">
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    <span className="bi bi-people"></span> Total de Estudiantes
                  </span>
                  <span className="home-resumen-valor">
                    {stats.estudiantes_totales}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    <span className="bi bi-person-circle"></span> Total de Encargados
                  </span>
                  <span className="home-resumen-valor">
                    {stats.encargados_totales}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    <span className="bi bi-envelope"></span> Comunicaciones Enviadas
                  </span>
                  <span className="home-resumen-valor">
                    {stats.comunicaciones_enviadas}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    <span className="bi bi-envelope-open"></span> Correos Individuales
                  </span>
                  <span className="home-resumen-valor">
                    {stats.correos_totales}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Historial de Acciones */}
          <section className="home-historial">
            <h2><span className="bi bi-clock-history"></span> Historial de Transacciones</h2>
            <div className="historial-container">
              {historial.length === 0 ? (
                <p className="historial-vacio">No hay acciones registradas</p>
              ) : (
                <div className="historial-lista">
                  {historial.map((accion) => (
                    <div key={accion.id} className="historial-item">
                      <div className="historial-icono">
                        {accion.tipo_accion.includes('crear') && <span className="bi bi-plus-circle"></span>}
                        {accion.tipo_accion.includes('editar') && <span className="bi bi-pencil-square"></span>}
                        {accion.tipo_accion.includes('eliminar') && <span className="bi bi-trash3"></span>}
                        {accion.tipo_accion.includes('enviar') && <span className="bi bi-envelope-send"></span>}
                      </div>
                      <div className="historial-info">
                        <p className="historial-descripcion">{accion.descripcion}</p>
                        <p className="historial-detalles">{accion.detalles}</p>
                      </div>
                      <div className="historial-meta">
                        <span className="historial-usuario"><span className="bi bi-person"></span> {accion.usuario}</span>
                        <span className="historial-fecha">
                          {new Date(accion.fecha_hora).toLocaleString('es-CR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
