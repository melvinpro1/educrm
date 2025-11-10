import React, { useState } from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import "./index.css"; // si aquí tienes estilos globales
import VistaEstudiante from "./paginas/VistaEstudiante.jsx";
import VistaEncargados from "./paginas/VistaEncargado.jsx";
import VistaComunicacion from "./paginas/VistaComunicacion.jsx";

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
      case "encargados":
        return <VistaEncargados/>;
      case "comunicaciones":
        return <VistaComunicacion/>;  
      default:
        return <Home />; // por si acaso
    }
  };

   return (
    <div className="layout-principal">
      <Sidebar
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
      />
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;
