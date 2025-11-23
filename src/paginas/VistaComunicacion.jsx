// 📁 src/paginas/Comunicaciones.jsx
// Vista principal del Sistema de Comunicaciones.
// Muestra estadísticas y un historial de comunicaciones registradas.


// import React, { useState } from "react";
// import "../recursos/estilos/VistaComunicacion.css";

// // Datos de ejemplo (luego se reemplaza con datos desde backend)
// const comunicacionesIniciales = [
//   {
//     id: 1,
//     asunto: "Mensaje de información",
//     tipo: "institucional",
//     segmento: "cuarto",
//     estado: "fallido", // enviado | pendiente | fallido
//     fecha: "12 de octubre, 16:04",
//     enviados: 0,
//     mensaje: "Recordatorio sobre la reunión de padres de familia.",
//     destinatarios: [
//       "maria.gonzalez@ccsp.ed.cr",
//       "carlos.mora@ccsp.ed.cr",
//     ],
//   },
// ];


// function Comunicaciones() {
//   const [comunicaciones] = useState(comunicacionesIniciales);
//   const totalComunicaciones = comunicaciones.length;
//   const totalEnviados = comunicaciones.reduce(
//     (acc, c) => acc + c.enviados,
//     0
//   );
//   const ultima = comunicaciones[0] || null;

//   return (
//     <div className="comms">
//       {/* Encabezado */}
//       <div className="comms-header">
//         <div>
//           <h1>Sistema de Comunicaciones</h1>
//           <p>
//             Envía correos masivos y segmentados a estudiantes y encargados.
//           </p>
//         </div>
//         <button className="btn-nueva-comunicacion">
//           + Nueva Comunicación
//         </button>
//       </div>

//       {/* Resumen superior */}
//       <div className="comms-resumen">
//         <div className="comms-card">
//           <p className="comms-card-titulo">Total Comunicaciones</p>
//           <div className="comms-card-body">
//             <div className="comms-icono azul">📨</div>
//             <div>
//               <h2>{totalComunicaciones}</h2>
//               <span>Registradas</span>
//             </div>
//           </div>
//         </div>

//         <div className="comms-card">
//           <p className="comms-card-titulo">Correos Enviados</p>
//           <div className="comms-card-body">
//             <div className="comms-icono verde">📧</div>
//             <div>
//               <h2>{totalEnviados}</h2>
//               <span>Total</span>
//             </div>
//           </div>
//         </div>

//         <div className="comms-card">
//           <p className="comms-card-titulo">Última Comunicación</p>
//           <div className="comms-card-body">
//             <div className="comms-icono morado">⏱</div>
//             <div>
//               <h3>{ultima ? ultima.asunto : "Sin registros"}</h3>
//               <span>
//                 {ultima
//                   ? `${ultima.enviados} enviados`
//                   : "Aún no hay comunicaciones"}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Historial */}
//       <section className="comms-historial">
//         <h2>Historial de Comunicaciones</h2>

//         {comunicaciones.map((com) => (
//           <div key={com.id} className="comms-item">
//             <div className="comms-item-header">
//               <div className="comms-item-icon">📩</div>
//               <div className="comms-item-info">
//                 <h3>{com.asunto}</h3>

//                 <div className="comms-tags">
//                   <span className="tag tipo">
//                     {com.tipo}
//                   </span>
//                   <span className="tag segmento">
//                     {com.segmento}
//                   </span>
//                   <span
//                     className={
//                       "tag estado " +
//                       (com.estado === "enviado"
//                         ? "ok"
//                         : com.estado === "pendiente"
//                         ? "pendiente"
//                         : "error")
//                     }
//                   >
//                     {com.estado}
//                   </span>
//                 </div>

//                 <div className="comms-meta">
//                   <span>📅 {com.fecha}</span>
//                   <span>👥 {com.enviados} enviados</span>
//                 </div>
//               </div>
//             </div>

//             <div className="comms-item-body">
//               <p className="comms-label">Mensaje:</p>
//               <p className="comms-mensaje">{com.mensaje}</p>

//               <p className="comms-label">
//                 Destinatarios ({com.destinatarios.length}):
//               </p>
//               <div className="comms-destinatarios">
//                 {com.destinatarios.map((d, i) => (
//                   <span key={i} className="chip">
//                     {d}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}

//         {comunicaciones.length === 0 && (
//           <p className="comms-vacio">
//             Aún no hay comunicaciones registradas.
//           </p>
//         )}
//       </section>
//     </div>
//   );
// }

// export default Comunicaciones;

// 📁 src/paginas/Comunicaciones.jsx
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
  // estado de la lista
  const [comunicaciones, setComunicaciones] = useState(comunicacionesIniciales);

  // estado para mostrar/ocultar formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // estado del formulario
  const [formData, setFormData] = useState({
    asunto: "",
    mensaje: "",
    tipoCorreo: "institucional",
    segmento: "todos",        // todos | estudiantes | encargados
    gradoEstudiante: "todos", // cuartos | quintos | todos
    tipoEmailEstudiante: "institucional", // institucional | personal | ambos
  });

  const totalComunicaciones = comunicaciones.length;
  const totalEnviados = comunicaciones.reduce((acc, c) => acc + c.enviados, 0);
  const ultima = comunicaciones[0] || null;

  // handlers
  const handleNuevaClick = () => {
    setMostrarFormulario(true); // si quieres toggle: !mostrarFormulario
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setFormData({
      asunto: "",
      mensaje: "",
      tipoCorreo: "institucional",
      segmento: "todos",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ahora = new Date();
    const fechaTexto = ahora.toLocaleString("es-CR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const nueva = {
      id: comunicaciones.length + 1,
      asunto: formData.asunto,
      tipo: formData.tipoCorreo,
      segmento: formData.segmento,
      estado: "pendiente",
      fecha: fechaTexto,
      enviados: 0,
      mensaje: formData.mensaje,
      destinatarios: [], // luego se llena según la segmentación
      // solo relevante si segmento === "estudiantes"
      gradoEstudiante: formData.gradoEstudiante,
      tipoEmailEstudiante: formData.tipoEmailEstudiante,
    };

    // la agregamos al inicio del historial
    setComunicaciones((prev) => [nueva, ...prev]);

    // limpiar y cerrar
    handleCancelar();
  };

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
        <button className="btn-nueva-comunicacion" onClick={handleNuevaClick}>
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

      {/* NUEVA COMUNICACIÓN */}
      {mostrarFormulario && (
        <section className="comms-nueva card">
          <h2>Nueva Comunicación</h2>

          <form className="form-comunicacion" onSubmit={handleSubmit}>
            <div className="campo">
              <label>Asunto *</label>
              <input
                type="text"
                name="asunto"
                placeholder="Asunto del correo"
                value={formData.asunto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label>Mensaje *</label>
              <textarea
                name="mensaje"
                placeholder="Escribe el contenido del mensaje..."
                rows={5}
                value={formData.mensaje}
                onChange={handleChange}
                required
              />
            </div>

            <div className="fila-dos-columnas">
              <div className="campo">
                <label>Tipo de Correo *</label>
                <select
                  name="tipoCorreo"
                  value={formData.tipoCorreo}
                  onChange={handleChange}
                >
                  <option value="institucional">Institucional</option>
                  <option value="recordatorio">Recordatorio</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="campo">
                <label>Segmentación *</label>
                <select
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleChange}
                >
                  <option value="todos">Todos</option>
                  <option value="estudiantes">Solo estudiantes</option>
                  <option value="encargados">Solo encargados</option>
                </select>
              </div>
            </div>

            {/* Campos adicionales solo para estudiantes */}
            {formData.segmento === "estudiantes" && (
              <div className="fila-dos-columnas">
                <div className="campo">
                  <label>Nivel / Grupo *</label>
                  <select
                    name="gradoEstudiante"
                    value={formData.gradoEstudiante}
                    onChange={handleChange}
                  >
                    <option value="todos">Cuartos y Quintos</option>
                    <option value="cuartos">Solo Cuartos</option>
                    <option value="quintos">Solo Quintos</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Tipo de correo del estudiante *</label>
                  <select
                    name="tipoEmailEstudiante"
                    value={formData.tipoEmailEstudiante}
                    onChange={handleChange}
                  >
                    <option value="institucional">Institucional</option>
                    <option value="personal">Personal</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
              </div>
            )}

            <div className="acciones-form">
              <button
                type="button"
                className="btn-secundario"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primario">
                Guardar Comunicación
              </button>
            </div>
          </form>
        </section>
      )}

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
                  <span className="tag tipo">{com.tipo}</span>
                  <span className="tag segmento">{com.segmento}</span>
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
