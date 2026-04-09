import React from "react";

function DetalleCurso({ curso }) {
  return (
    <>
      {/* Sección: Información del Curso */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-book"></span> Información del Curso
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Nombre</span>
            <span className="detalle-valor">{curso.nombre}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Nivel/Grado</span>
            <span className="detalle-valor">{curso.nivel_grado}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Año Lectivo</span>
            <span className="detalle-valor">{curso.año_lectivo}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Estado</span>
            <div>
              <span className={`detalle-badge ${curso.estado === "activo" ? "activo" : "inactivo"}`}>
                {curso.estado === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Detalles Académicos */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-calendar"></span> Detalles Académicos
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Horario</span>
            <span className="detalle-valor">
              {curso.horario || <span className="vacio">No especificado</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Sección: Profesor Asignado */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-person-badge"></span> Profesor Asignado
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Profesor</span>
            <span className="detalle-valor">
              {curso.profesor_nombre || <span className="vacio">No especificado</span>}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">ID Profesor</span>
            <span className="detalle-valor">{curso.id_profesor}</span>
          </div>
        </div>
      </div>

      {/* Sección: Información Administrativa */}
      <div className="detalle-seccion">
        <h3 className="detalle-seccion-titulo">
          <span className="bi bi-clock-history"></span> Información Administrativa
        </h3>
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-label">Fecha de Creación</span>
            <span className="detalle-valor">
              {new Date(curso.fecha_creacion).toLocaleDateString("es-CR")}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-label">Última Actualización</span>
            <span className="detalle-valor">
              {new Date(curso.fecha_actualizacion).toLocaleDateString("es-CR")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetalleCurso;
