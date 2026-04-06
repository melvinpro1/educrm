import React from "react";

function DetalleProfesor({ profesor }) {
  return (
    <>
      {/* Sección: Información Personal */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-person-badge"></span> Información Personal
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Nombre Completo</span>
            <span className="detalle-valor">{profesor.nombre}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Cédula</span>
            <span className="detalle-valor">
              {profesor.cedula || <span className="vacio">No especificado</span>}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Estado</span>
            <div>
              <span className={`detalle-badge ${profesor.activo ? "activo" : "inactivo"}`}>
                {profesor.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Información de Contacto */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-envelope"></span> Información de Contacto
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Correo</span>
            <span className="detalle-valor">
              {profesor.correo || <span className="vacio">No especificado</span>}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Teléfono</span>
            <span className="detalle-valor">
              {profesor.telefono || <span className="vacio">No especificado</span>}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetalleProfesor;
