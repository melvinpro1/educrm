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
import VistaPermisos from "./paginas/VistaPermisos.jsx";
import VistaNotas from "./paginas/VistaNotas.jsx";
import { isAuthenticated, tienePermiso, isAdmin } from "./api/auth";

function App() {
  const [vistaActiva, setVistaActiva] = useState("home");
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  useEffect(() => {
    setAutenticado(isAuthenticated());
    setCargando(false);
  }, []);

  const handleLoginExitoso = () => {
    setAutenticado(true);
    setVistaActiva("home");
  };

  const handleLogout = () => {
    setAutenticado(false);
    setVistaActiva("home");
    setSidebarAbierto(false);
  };

  const cambiarVista = (id) => {
    if (id === "home" || tienePermiso(id)) {
      setVistaActiva(id);
    }
    setSidebarAbierto(false);
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
          onRegistroExitoso={() => {
            setMostrarRegistro(false);
          }}
          onVolverLogin={() => setMostrarRegistro(false)}
        />
      );
    }
    if (mostrarRecuperar) {
      return <RecuperarPassword onVolver={() => setMostrarRecuperar(false)} />;
    }
    return (
      <Login
        onLoginExitoso={handleLoginExitoso}
        onMostrarRegistro={() => setMostrarRegistro(true)}
        onMostrarRecuperar={() => setMostrarRecuperar(true)}
      />
    );
  }

  const renderContenido = () => {
    const admin = isAdmin();

    if (vistaActiva !== "home" && !admin && !tienePermiso(vistaActiva)) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "48px", margin: "0 0 8px" }}>🔒</p>
          <h2 style={{ margin: "0 0 8px" }}>Acceso restringido</h2>
          <p>No tienes permiso para ver esta sección.</p>
        </div>
      );
    }

    switch (vistaActiva) {
      case "home":          return <Home />;
      case "estudiantes":   return <VistaEstudiante />;
      case "encargados":    return <VistaEncargados />;
      case "comunicaciones":return <VistaComunicacion />;
      case "profesores":    return <VistaProfesores />;
      case "cursos":        return <VistaCursos />;
      case "activos":       return <VistaActivos />;
      case "prestamos":     return <VistaPrestamos />;
      case "usuarios":      return <VistaUsuarios />;
      case "notas":         return <VistaNotas />;
      case "permisos":      return admin ? <VistaPermisos /> : null;
      default:              return <Home />;
    }
  };

  return (
    <div className="layout-principal">
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
        onCambiarVista={cambiarVista}
        onLogout={handleLogout}
        abierto={sidebarAbierto}
      />
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;
