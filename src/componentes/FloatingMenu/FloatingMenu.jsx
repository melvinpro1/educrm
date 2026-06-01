import React, { useState } from "react";
import "./FloatingMenu.css";
import { logout, getCurrentUser } from "../../api/auth";

const categoriasMenu = [
  {
    id: "principal",
    nombre: "Panel Principal",
    icono: "📊",
    items: [{ id: "home", etiqueta: "Panel Principal" }],
  },
  {
    id: "personas",
    nombre: "Gestión de Personas",
    icono: "👥",
    items: [
      { id: "estudiantes", etiqueta: "Estudiantes" },
      { id: "encargados", etiqueta: "Encargados" },
      { id: "profesores", etiqueta: "Profesores" },
    ],
  },
  {
    id: "academica",
    nombre: "Gestión Académica",
    icono: "📚",
    items: [
      { id: "cursos", etiqueta: "Cursos" },
      { id: "comunicaciones", etiqueta: "Comunicaciones" },
    ],
  },
  {
    id: "recursos",
    nombre: "Gestión de Recursos",
    icono: "📦",
    items: [
      { id: "activos", etiqueta: "Activos" },
      { id: "prestamos", etiqueta: "Préstamos" },
    ],
  },
];

function FloatingMenu({ vistaActiva, onCambiarVista, onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({
    principal: true,
    personas: false,
    academica: false,
    recursos: false,
  });

  const usuario = getCurrentUser();

  const toggleCategoria = (categoriaId) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoriaId]: !prev[categoriaId],
    }));
  };

  const handleSeleccionarOpcion = (itemId) => {
    onCambiarVista(itemId);
    setMenuAbierto(false);
  };

  const handleCerrarSesion = () => {
    const confirmar = window.confirm("¿Está seguro que desea cerrar sesión?");
    if (confirmar) {
      logout();
      if (onLogout) onLogout();
    }
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "U";
    const palabras = nombre.split(" ");
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={`floating-menu-boton ${menuAbierto ? "activo" : ""}`}
        onClick={() => setMenuAbierto(!menuAbierto)}
        title="Abrir menú"
      >
        <span className="floating-menu-icono">☰</span>
      </button>

      {/* Menú desplegable */}
      {menuAbierto && (
        <>
          {/* Overlay para cerrar el menú */}
          <div
            className="floating-menu-overlay"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Contenedor del menú */}
          <div className="floating-menu-contenedor">
            {/* Encabezado del menú */}
            <div className="floating-menu-encabezado">
              <div className="floating-menu-usuario-info">
                <div className="floating-menu-avatar">
                  {obtenerIniciales(
                    usuario?.username || usuario?.first_name || "Usuario"
                  )}
                </div>
                <div>
                  <p className="floating-menu-usuario-nombre">
                    {usuario?.first_name && usuario?.last_name
                      ? `${usuario.first_name} ${usuario.last_name}`
                      : usuario?.username || "Usuario"}
                  </p>
                  <p className="floating-menu-usuario-rol">
                    {usuario?.is_staff ? "Administrador" : "Usuario"}
                  </p>
                </div>
              </div>
              <button
                className="floating-menu-cerrar"
                onClick={() => setMenuAbierto(false)}
              >
                ✕
              </button>
            </div>

            {/* Categorías */}
            <div className="floating-menu-categorias">
              {categoriasMenu.map((categoria) => (
                <div
                  key={categoria.id}
                  className="floating-menu-categoria"
                >
                  {/* Encabezado de categoría */}
                  <button
                    className="floating-menu-categoria-encabezado"
                    onClick={() => toggleCategoria(categoria.id)}
                  >
                    <span className="floating-menu-categoria-icono">
                      {categoria.icono}
                    </span>
                    <span className="floating-menu-categoria-nombre">
                      {categoria.nombre}
                    </span>
                    <span
                      className={`floating-menu-categoria-toggle ${
                        categoriasExpandidas[categoria.id] ? "expandido" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Items de la categoría */}
                  {categoriasExpandidas[categoria.id] && (
                    <div className="floating-menu-categoria-items">
                      {categoria.items.map((item) => (
                        <button
                          key={item.id}
                          className={`floating-menu-item ${
                            vistaActiva === item.id ? "activo" : ""
                          }`}
                          onClick={() => handleSeleccionarOpcion(item.id)}
                        >
                          {item.etiqueta}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Botón cerrar sesión */}
            <button
              className="floating-menu-cerrar-sesion"
              onClick={handleCerrarSesion}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default FloatingMenu;
