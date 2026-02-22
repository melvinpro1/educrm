import React from "react";

function DetalleEncargado({ encargado }) {
  return (
    <>
      {/* Sección: Información Personal */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-person"></span> Información Personal
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Nombre Completo</span>
            <span className="detalle-valor">{encargado.nombre}</span>
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
            <span className="detalle-label">Correo Electrónico</span>
            <span className="detalle-valor">{encargado.correo}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Teléfono</span>
            <span className="detalle-valor">
              {encargado.telefono || (
                <span className="vacio">No especificado</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetalleEncargado;
