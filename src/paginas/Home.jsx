import React from "react";
import "../recursos/estilos/Home.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Datos de ejemplo para el gráfico
const datosNiveles = [
  { nombre: "Cuarto Nivel", valor: 2, color: "#3B82F6" },
  { nombre: "Quinto Nivel", valor: 2, color: "#10B981" },
];

function Home() {
  const fecha = new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

      {/* Tarjetas */}
      <section className="home-tarjetas">
        <div className="home-tarjeta azul">
          <h3>Estudiantes Activos</h3>
          <p className="home-numero">4 / 4</p>
          <span className="home-extra">+100%</span>
        </div>

        <div className="home-tarjeta verde">
          <h3>Encargados Registrados</h3>
          <p className="home-numero">5</p>
        </div>

        <div className="home-tarjeta morado">
          <h3>Comunicaciones Enviadas</h3>
          <p className="home-numero">1</p>
        </div>

        <div className="home-tarjeta naranja">
          <h3>Correos Totales</h3>
          <p className="home-numero">0</p>
        </div>
      </section>

      {/* Gráficos */}
      <section className="home-graficos">
        <div className="home-grafico">
          <h2>Distribución por Nivel Académico</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={datosNiveles}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {datosNiveles.map((nivel, i) => (
                  <Cell key={i} fill={nivel.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="home-grafico">
          <h2>Actividad de Comunicaciones</h2>
          <p className="home-placeholder">
            📈 Aquí se mostrará la actividad de correos enviados.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
