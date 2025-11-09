import React, { useState } from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import "./index.css"; // si aquí tienes estilos globales
import VistaEstudiante from "./paginas/VistaEstudiante.jsx";

function App() {
  // Estado global simple para saber qué vista mostrar
  const [vistaActiva, setVistaActiva] = useState("home"); // "home" | "estudiantes"

  // Decide qué componente mostrar según lo que venga del Sidebar
  const renderContenido = () => {
    switch (vistaActiva) {
      case "home":
        return <Home />;
      case "estudiantes":
        return <VistaEstudiante/>;
      default:
        return <Home />; // por si acaso
    }
  };

  return (
    <div className="layout-principal">
      {/* Sidebar recibe la vista actual y la función para cambiarla */}
      <Sidebar
        vistaActiva={vistaActiva}
        onCambiarVista={(nuevaVista) => setVistaActiva(nuevaVista)}
      />

      {/* Contenido dinámico */}
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;
