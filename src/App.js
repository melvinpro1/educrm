import React, { useState, useEffect } from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import "./index.css";
import VistaEstudiante from "./paginas/VistaEstudiante.jsx";
import VistaEncargados from "./paginas/VistaEncargado.jsx";
import VistaComunicacion from "./paginas/VistaComunicacion.jsx";
import VistaProfesores from "./paginas/VistaProfesores.jsx";
import VistaCursos from "./paginas/VistaCursos.jsx";
import VistaActivos from "./paginas/VistaActivos.jsx";
import VistaPrestamos from "./paginas/VistaPrestamos.jsx";
import { isAuthenticated } from "./api/auth";

function App() {
  const [vistaActiva, setVistaActiva] = useState("home");
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    const estaAutenticado = isAuthenticated();
    setAutenticado(estaAutenticado);
    setCargando(false);
  }, []);

  const handleLoginExitoso = () => {
    setAutenticado(true);
  };

  const handleRegistroExitoso = () => {
    setAutenticado(true);
    setMostrarRegistro(false);
  };

  const handleLogout = () => {
    setAutenticado(false);
    setVistaActiva("home");
  };

  const handleMostrarRegistro = () => {
    setMostrarRegistro(true);
  };

  const handleMostrarLogin = () => {
    setMostrarRegistro(false);
  };

  if (cargando) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#6b7280",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!autenticado) {
    if (mostrarRegistro) {
      return (
        <Registro
          onRegistroExitoso={handleRegistroExitoso}
          onVolverLogin={handleMostrarLogin}
        />
      );
    }
    return (
      <Login
        onLoginExitoso={handleLoginExitoso}
        onMostrarRegistro={handleMostrarRegistro}
      />
    );
  }

  const renderContenido = () => {
    switch (vistaActiva) {
      case "home":
        return <Home />;
      case "estudiantes":
        return <VistaEstudiante />;
      case "encargados":
        return <VistaEncargados />;
      case "comunicaciones":
        return <VistaComunicacion />;
      case "profesores":
        return <VistaProfesores />;
      case "cursos":
        return <VistaCursos />;
      case "activos":
        return <VistaActivos />;
      case "prestamos":
        return <VistaPrestamos />;

      default:

        return <Home />;
    }
  };

  return (
    <div className="layout-principal">
      <Sidebar
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
        onLogout={handleLogout}
      />
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;