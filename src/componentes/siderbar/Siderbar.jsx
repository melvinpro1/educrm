// Menú lateral de EduCRM

import React from "react";
import "./Siderbar.css";
import logo from "../../recursos/imagenes/logo.jpg"; // ajusta si tu logo está en otra ruta

// Definimos las opciones con un id que usaremos en App.js
const opcionesMenu = [
  { id: "home", etiqueta: "Panel Principal" },
  { id: "estudiantes", etiqueta: "Estudiantes" },
  { id: "encargados", etiqueta: "Encargados" },
  { id: "comunicaciones", etiqueta: "Comunicaciones" },
  { id: "usuarios", etiqueta: "Usuarios del Sistema" },
];

function Sidebar({ vistaActiva, onCambiarVista }) {
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
                // Solo cambiamos vista si existe el handler
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
        <div className="sidebar-usuario-avatar">M</div>
        <div className="sidebar-usuario-info">
          <p className="sidebar-usuario-nombre">Melvin Blanco</p>
          <p className="sidebar-usuario-rol">Admin</p>
        </div>
      </div>

      <button className="sidebar-boton-cerrar">⏻ Cerrar Sesión</button>
    </aside>
  );
}

export default Sidebar;
