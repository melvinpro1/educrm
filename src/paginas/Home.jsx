import React, { useEffect, useState } from "react";
import "../recursos/estilos/Home.css";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { getDashboardStats } from "../api/dashboard";

// Colores para el gráfico
const COLORES = {
  "Cuarto Nivel": "#3B82F6",
  "Quinto Nivel": "#10B981",
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
  }, []);

  async function cargarEstadisticas() {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  }

  // Formatear datos para el gráfico
  const datosGrafico = stats.estudiantes_por_nivel.map((nivel) => ({
    nombre: nivel.nombre,
    valor: nivel.valor,
    color: COLORES[nivel.nombre] || "#6B7280",
  }));

  // Calcular porcentaje de estudiantes activos
  const porcentajeActivos =
    stats.estudiantes_totales > 0
      ? Math.round((stats.estudiantes_activos / stats.estudiantes_totales) * 100)
      : 0;

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
              <h3>Estudiantes Activos</h3>
              <p className="home-numero">
                {stats.estudiantes_activos} / {stats.estudiantes_totales}
              </p>
              <span className="home-extra">{porcentajeActivos}%</span>
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
                      label
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
                  📊 No hay estudiantes registrados aún.
                </p>
              )}
            </div>

            <div className="home-grafico">
              <h2>Resumen de Actividad</h2>
              <div className="home-resumen">
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    📚 Total de Estudiantes
                  </span>
                  <span className="home-resumen-valor">
                    {stats.estudiantes_totales}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    ✅ Estudiantes Activos
                  </span>
                  <span className="home-resumen-valor">
                    {stats.estudiantes_activos}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    📧 Comunicaciones Enviadas
                  </span>
                  <span className="home-resumen-valor">
                    {stats.comunicaciones_enviadas}
                  </span>
                </div>
                <div className="home-resumen-item">
                  <span className="home-resumen-label">
                    ✉️ Correos Individuales
                  </span>
                  <span className="home-resumen-valor">
                    {stats.correos_totales}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
