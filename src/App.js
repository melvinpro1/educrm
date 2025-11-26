import React, { useState, useEffect } from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import "./index.css"; // si aquí tienes estilos globales
import VistaEstudiante from "./paginas/VistaEstudiante.jsx";
import VistaEncargados from "./paginas/VistaEncargado.jsx";
import VistaComunicacion from "./paginas/VistaComunicacion.jsx";
import { isAuthenticated } from "./api/auth";

function App() {
  // Estado global simple para saber qué vista mostrar
  const [vistaActiva, setVistaActiva] = useState("home"); // "home" | "estudiantes"
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const estaAutenticado = isAuthenticated();
    setAutenticado(estaAutenticado);
    setCargando(false);
  }, []);

  // Callback para cuando el usuario inicia sesión exitosamente
  const handleLoginExitoso = () => {
    setAutenticado(true);
  };

  // Callback para cuando el usuario se registra exitosamente
  const handleRegistroExitoso = () => {
    setAutenticado(true);
    setMostrarRegistro(false);
  };

  // Callback para cuando el usuario cierra sesión
  const handleLogout = () => {
    setAutenticado(false);
    setVistaActiva("home");
  };

  // Callback para cambiar entre login y registro
  const handleMostrarRegistro = () => {
    setMostrarRegistro(true);
  };

  const handleMostrarLogin = () => {
    setMostrarRegistro(false);
  };

  // Mostrar pantalla de carga mientras verifica autenticación
  if (cargando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Cargando...
      </div>
    );
  }

  // Si no está autenticado, mostrar login o registro
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
        onLogout={handleLogout}
      />
      <main className="contenido-principal">{renderContenido()}</main>
    </div>
  );
}

export default App;
