// Menú lateral de EduCRM

import React from "react";
import "./Siderbar.css";
import logo from "../../recursos/imagenes/logo.jpg";
import { logout, getCurrentUser } from "../../api/auth";

// Definimos las opciones con un id que usaremos en App.js
const opcionesMenu = [
  { id: "home", etiqueta: "Panel Principal" },
  { id: "estudiantes", etiqueta: "Estudiantes" },
  { id: "encargados", etiqueta: "Encargados" },
  { id: "profesores", etiqueta: "Profesores" },
  { id: "cursos", etiqueta: "Cursos" },
  { id: "comunicaciones", etiqueta: "Comunicaciones" },

];

function Sidebar({ vistaActiva, onCambiarVista, onLogout }) {
  const usuario = getCurrentUser();

  const handleCerrarSesion = () => {
    const confirmar = window.confirm("¿Está seguro que desea cerrar sesión?");
    if (confirmar) {
      logout();
      if (onLogout) onLogout();
    }
  };

  // Obtener iniciales del usuario
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "U";
    const palabras = nombre.split(" ");
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* Logo + título */}
      <div className="sidebar-encabezado">
        <div className="sidebar-logo-contenedor">
          <img src={logo} alt="Logo EduCRM" className="sidebar-logo" />
        </div>
        <div>
          <h2 className="sidebar-titulo">EduCRM</h2>
          <p className="sidebar-subtitulo">CCSP - Puntarenas</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <p className="sidebar-seccion-titulo">NAVEGACIÓN</p>
        <ul className="sidebar-lista">
          {opcionesMenu.map((opcion) => (
            <li
              key={opcion.id}
              className={
                "sidebar-item" +
                (vistaActiva === opcion.id ? " sidebar-item-activo" : "")
              }
              onClick={() => {
                if (onCambiarVista) onCambiarVista(opcion.id);
              }}
            >
              <span className="sidebar-item-texto">{opcion.etiqueta}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sistema */}
      <div className="sidebar-sistema">
        <p className="sidebar-sistema-titulo">SISTEMA</p>
        <div className="sidebar-sistema-card">
          <p>Colegio Científico</p>
          <p>Sede Puntarenas</p>
          <hr />
          <p className="sidebar-sistema-version">Sistema de Gestión</p>
          <p className="sidebar-sistema-version">Versión 1.0</p>
        </div>
      </div>

      {/* Usuario */}
      <div className="sidebar-usuario">
        <div className="sidebar-usuario-avatar">
          {obtenerIniciales(usuario?.username || usuario?.first_name || "Usuario")}
        </div>
        <div className="sidebar-usuario-info">
          <p className="sidebar-usuario-nombre">
            {usuario?.first_name && usuario?.last_name
              ? `${usuario.first_name} ${usuario.last_name}`
              : usuario?.username || "Usuario"}
          </p>
          <p className="sidebar-usuario-rol">
            {usuario?.is_staff ? "Administrador" : "Usuario"}
          </p>
        </div>
      </div>

      <button className="sidebar-boton-cerrar" onClick={handleCerrarSesion}>
        Cerrar Sesión
      </button>
    </aside>
  );
}

export default Sidebar;