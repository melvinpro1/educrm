// 📁 src/paginas/Comunicaciones.jsx
// Vista principal del Sistema de Comunicaciones.
// Muestra estadísticas y un historial de comunicaciones registradas.

import React, { useState } from "react";
import "../recursos/estilos/VistaComunicacion.css";

// Datos de ejemplo (luego se reemplaza con datos desde backend)
const comunicacionesIniciales = [
  {
    id: 1,
    asunto: "Mensaje de información",
    tipo: "institucional",
    segmento: "cuarto",
    estado: "fallido", // enviado | pendiente | fallido
    fecha: "12 de octubre, 16:04",
    enviados: 0,
    mensaje: "Recordatorio sobre la reunión de padres de familia.",
    destinatarios: [
      "maria.gonzalez@ccsp.ed.cr",
      "carlos.mora@ccsp.ed.cr",
    ],
  },
];

function Comunicaciones() {
  const [comunicaciones] = useState(comunicacionesIniciales);
  const totalComunicaciones = comunicaciones.length;
  const totalEnviados = comunicaciones.reduce(
    (acc, c) => acc + c.enviados,
    0
  );
  const ultima = comunicaciones[0] || null;

  return (
    <div className="comms">
      {/* Encabezado */}
      <div className="comms-header">
        <div>
          <h1>Sistema de Comunicaciones</h1>
          <p>
            Envía correos masivos y segmentados a estudiantes y encargados.
          </p>
        </div>
        <button className="btn-nueva-comunicacion">
          + Nueva Comunicación
        </button>
      </div>

      {/* Resumen superior */}
      <div className="comms-resumen">
        <div className="comms-card">
          <p className="comms-card-titulo">Total Comunicaciones</p>
          <div className="comms-card-body">
            <div className="comms-icono azul">📨</div>
            <div>
              <h2>{totalComunicaciones}</h2>
              <span>Registradas</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Correos Enviados</p>
          <div className="comms-card-body">
            <div className="comms-icono verde">📧</div>
            <div>
              <h2>{totalEnviados}</h2>
              <span>Total</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Última Comunicación</p>
          <div className="comms-card-body">
            <div className="comms-icono morado">⏱</div>
            <div>
              <h3>{ultima ? ultima.asunto : "Sin registros"}</h3>
              <span>
                {ultima
                  ? `${ultima.enviados} enviados`
                  : "Aún no hay comunicaciones"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <section className="comms-historial">
        <h2>Historial de Comunicaciones</h2>

        {comunicaciones.map((com) => (
          <div key={com.id} className="comms-item">
            <div className="comms-item-header">
              <div className="comms-item-icon">📩</div>
              <div className="comms-item-info">
                <h3>{com.asunto}</h3>

                <div className="comms-tags">
                  <span className="tag tipo">
                    {com.tipo}
                  </span>
                  <span className="tag segmento">
                    {com.segmento}
                  </span>
                  <span
                    className={
                      "tag estado " +
                      (com.estado === "enviado"
                        ? "ok"
                        : com.estado === "pendiente"
                        ? "pendiente"
                        : "error")
                    }
                  >
                    {com.estado}
                  </span>
                </div>

                <div className="comms-meta">
                  <span>📅 {com.fecha}</span>
                  <span>👥 {com.enviados} enviados</span>
                </div>
              </div>
            </div>

            <div className="comms-item-body">
              <p className="comms-label">Mensaje:</p>
              <p className="comms-mensaje">{com.mensaje}</p>

              <p className="comms-label">
                Destinatarios ({com.destinatarios.length}):
              </p>
              <div className="comms-destinatarios">
                {com.destinatarios.map((d, i) => (
                  <span key={i} className="chip">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {comunicaciones.length === 0 && (
          <p className="comms-vacio">
            Aún no hay comunicaciones registradas.
          </p>
        )}
      </section>
    </div>
  );
}

export default Comunicaciones;
