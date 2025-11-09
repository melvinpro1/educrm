// Menú lateral de EduCRM

import React from "react";
import "./Siderbar.css";
import logo from "../../recursos/imagenes/logo.jpg"; // ajusta si tu logo está en otra ruta

const opcionesMenu = [
  { id: 1, etiqueta: "Panel Principal", activo: true },
  { id: 2, etiqueta: "Estudiantes" },
  { id: 3, etiqueta: "Encargados" },
  { id: 4, etiqueta: "Comunicaciones" },
  { id: 5, etiqueta: "Usuarios del Sistema" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Encabezado con logo + nombre sistema */}
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
          {opcionesMenu.map((item) => (
            <li
              key={item.id}
              className={
                "sidebar-item" + (item.activo ? " sidebar-item-activo" : "")
              }
            >
              <span className="sidebar-item-texto">{item.etiqueta}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Info sistema */}
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

      {/* Usuario + botón */}
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
