import React, { useState, useEffect } from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import RecuperarPassword from "./paginas/RecuperarPassword";
import "./index.css";
import VistaEstudiante from "./paginas/VistaEstudiante.jsx";
import VistaEncargados from "./paginas/VistaEncargado.jsx";
import VistaComunicacion from "./paginas/VistaComunicacion.jsx";
import VistaProfesores from "./paginas/VistaProfesores.jsx";
import VistaCursos from "./paginas/VistaCursos.jsx";
import VistaActivos from "./paginas/VistaActivos.jsx";
import VistaPrestamos from "./paginas/VistaPrestamos.jsx";
import VistaUsuarios from "./paginas/VistaUsuarios.jsx";
import { isAuthenticated } from "./api/auth";

function App() {
  const [vistaActiva, setVistaActiva] = useState("home");
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

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
    setSidebarAbierto(false);
  };

  const handleMostrarRegistro = () => {
    setMostrarRegistro(true);
  };

  const handleMostrarLogin = () => {
    setMostrarRegistro(false);
  };

  const handleMostrarRecuperar = () => {
    setMostrarRecuperar(true);
  };

  const handleVolverDesdeRecuperar = () => {
    setMostrarRecuperar(false);
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
    if (mostrarRecuperar) {
      return (
        <RecuperarPassword onVolver={handleVolverDesdeRecuperar} />
      );
    }
    return (
      <Login
        onLoginExitoso={handleLoginExitoso}
        onMostrarRegistro={handleMostrarRegistro}
        onMostrarRecuperar={handleMostrarRecuperar}
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
      case "usuarios":
        return <VistaUsuarios />;
      default:

        return <Home />;
    }
  };

  return (
    <div className="layout-principal">
      {/* Botón toggle del sidebar */}
      {sidebarAbierto && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <button
        className={`boton-toggle-sidebar ${sidebarAbierto ? "activo" : ""}`}
        onClick={() => setSidebarAbierto(!sidebarAbierto)}
        title="Abrir/cerrar menú"
      >
        ☰
      </button>

      <Sidebar
        vistaActiva={vistaActiva}
        onCambiarVista={(id) => {
          setVistaActiva(id);
          setSidebarAbierto(false);
        }}
        onLogout={handleLogout}
        abierto={sidebarAbierto}
      />
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;