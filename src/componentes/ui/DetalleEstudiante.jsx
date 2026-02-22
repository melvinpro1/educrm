import React from "react";

function DetalleEstudiante({ estudiante }) {
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
            <span className="detalle-valor">{estudiante.nombre}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Cédula</span>
            <span className="detalle-valor">
              {estudiante.cedula || <span className="vacio">No especificado</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Sección: Información Académica */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-book"></span> Información Académica
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Nivel/Grado</span>
            <div>
              <span
                className={`detalle-badge nivel ${
                  estudiante.grado === "Cuarto Nivel" ? "" : "verde"
                }`}
              >
                {estudiante.grado}
              </span>
            </div>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Colegio de Procedencia</span>
            <span className="detalle-valor">
              {estudiante.colegio_procedencia || (
                <span className="vacio">No especificado</span>
              )}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Estado</span>
            <div>
              <span className={`detalle-badge ${estudiante.estado ? "activo" : "inactivo"}`}>
                {estudiante.estado ? "Activo" : "Inactivo"}
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
            <span className="detalle-label">Correo Institucional</span>
            <span className="detalle-valor">{estudiante.correo_institucional}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Correo Personal</span>
            <span className="detalle-valor">
              {estudiante.correo_personal || (
                <span className="vacio">No especificado</span>
              )}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Teléfono</span>
            <span className="detalle-valor">
              {estudiante.telefono || <span className="vacio">No especificado</span>}
            </span>
          </div>
          <div className="detalle-campo" style={{ gridColumn: "1 / -1" }}>
            <span className="detalle-label">Dirección Domicilio</span>
            <span className="detalle-valor">
              {estudiante.direccion_domicilio || (
                <span className="vacio">No especificado</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Sección: Encargado */}
      {estudiante.encargado && (
        <div className="detalle-seccion">
          <h3 className="detalle-seccion-titulo">
            <span className="bi bi-person-circle"></span> Información del Encargado
          </h3>
          <div className="detalle-grid">
            <div className="detalle-campo">
              <span className="detalle-label">Nombre del Encargado</span>
              <span className="detalle-valor">{estudiante.encargado.nombre}</span>
            </div>
            <div className="detalle-campo">
              <span className="detalle-label">Correo del Encargado</span>
              <span className="detalle-valor">{estudiante.encargado.correo}</span>
            </div>
            <div className="detalle-campo">
              <span className="detalle-label">Teléfono del Encargado</span>
              <span className="detalle-valor">
                {estudiante.encargado.telefono || (
                  <span className="vacio">No especificado</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DetalleEstudiante;
