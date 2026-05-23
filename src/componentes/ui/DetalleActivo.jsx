import React from "react";

const ETIQUETAS_TIPO = {
  computadora: "Computadora",
  tablet: "Tablet",
  libro: "Libro",
  proyector: "Proyector",
  otro: "Otro",
};

const ETIQUETAS_ESTADO = {
  disponible: "Disponible",
  prestado: "Prestado",
  en_mantenimiento: "En mantenimiento",
};

function DetalleActivo({ activo }) {
  const prestamo = activo.prestamo_activo;

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>Tipo</p>
          <p style={{ fontWeight: 600, margin: 0 }}>{ETIQUETAS_TIPO[activo.tipo] || activo.tipo}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>Estado</p>
          <p style={{ fontWeight: 600, margin: 0 }}>{ETIQUETAS_ESTADO[activo.estado] || activo.estado}</p>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>Nombre</p>
          <p style={{ fontWeight: 600, margin: 0 }}>{activo.nombre}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>Registrado</p>
          <p style={{ margin: 0 }}>
            {activo.fecha_creacion
              ? new Date(activo.fecha_creacion).toLocaleDateString("es-CR")
              : "—"}
          </p>
        </div>
      </div>

      {prestamo && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: "8px",
          padding: "12px 16px",
          marginTop: "8px",
        }}>
          <p style={{ fontWeight: 700, margin: "0 0 8px", color: "#92400e" }}>
            Préstamo activo
          </p>
          <p style={{ margin: "4px 0", fontSize: "14px" }}>
            <strong>Estudiante:</strong> {prestamo.estudiante_nombre}
          </p>
          <p style={{ margin: "4px 0", fontSize: "14px" }}>
            <strong>Cédula:</strong> {prestamo.estudiante_cedula}
          </p>
          <p style={{ margin: "4px 0", fontSize: "14px" }}>
            <strong>Fecha de préstamo:</strong>{" "}
            {new Date(prestamo.fecha_prestamo + "T00:00:00").toLocaleDateString("es-CR")}
          </p>
          <p style={{ margin: "4px 0", fontSize: "14px" }}>
            <strong>Retorno esperado:</strong>{" "}
            {new Date(prestamo.fecha_retorno_esperada + "T00:00:00").toLocaleDateString("es-CR")}
          </p>
        </div>
      )}
    </div>
  );
}

export default DetalleActivo;
