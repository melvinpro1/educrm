// 📁 src/paginas/Comunicaciones.jsx
// Vista principal del Sistema de Comunicaciones.
// Muestra estadísticas y un historial de comunicaciones registradas.

import React, { useState, useEffect } from "react";
import "../recursos/estilos/VistaComunicacion.css";

function Comunicaciones() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [comunicaciones, setComunicaciones] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState({
    asunto: "",
    mensaje: "",
    tipoCorreo: "institucional",
    segmento: "todos",        // todos | estudiantes | encargados
    gradoEstudiante: "todos", // cuartos | quintos | todos
    tipoEmailEstudiante: "institucional", // institucional | personal | ambos
  });

  // IDs de estudiantes a los que se enviará el correo
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);

  const totalComunicaciones = comunicaciones.length;
  const totalEnviados = comunicaciones.reduce(
    (acc, c) => acc + (c.enviados || 0),
    0
  );
  const ultima = comunicaciones[0] || null;

  const token = localStorage.getItem("token"); // ajusta si lo guardás en otro lado

  // =========================
  //   CARGAR COMUNICACIONES
  // =========================
  useEffect(() => {
    const fetchComunicaciones = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/comunicaciones/correos/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          console.error("Error al cargar comunicaciones");
          return;
        }

        const data = await res.json();
        setComunicaciones(data);
      } catch (error) {
        console.error("Error de red al cargar comunicaciones:", error);
      }
    };

    fetchComunicaciones();
  }, [token]);

  // =========================
  //   CARGAR ESTUDIANTES
  // =========================
  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/estudiantes/", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Error al cargar estudiantes");
          return;
        }

        const data = await res.json();

        // Soportar tanto lista directa como paginada {results: [...]}
        const lista = Array.isArray(data) ? data : data.results || [];
        setEstudiantes(lista);

        console.log("Estudiantes desde API:", lista);
      } catch (err) {
        console.error("Error de red al cargar estudiantes:", err);
      }
    };

    fetchEstudiantes();
  }, []);

  // =========================
  //   SEGMENTACIÓN → IDs
  // =========================
  const actualizarEstudiantesSeleccionados = (config, listaEstudiantes) => {
    // Si no es segmento "estudiantes", no seleccionamos nada
    if (config.segmento !== "estudiantes") {
      setEstudiantesSeleccionados([]);
      return;
    }

    let filtrados = [...listaEstudiantes];

    // FILTRO POR GRADO según lo que tienes en BD: "Cuarto Nivel" / "Quinto Nivel"
    if (config.gradoEstudiante === "cuartos") {
      filtrados = filtrados.filter((est) => {
        if (!est.grado) return false;
        const g = est.grado.toString().toLowerCase();
        return g.includes("cuarto"); // "cuarto nivel"
      });
    } else if (config.gradoEstudiante === "quintos") {
      filtrados = filtrados.filter((est) => {
        if (!est.grado) return false;
        const g = est.grado.toString().toLowerCase();
        return g.includes("quinto"); // "quinto nivel"
      });
    }
    // si es "todos", no filtramos por grado

    const ids = filtrados.map((est) => est.id_estudiante);

    setEstudiantesSeleccionados(ids);
    console.log("Estudiantes filtrados:", filtrados);
    console.log("IDs seleccionados:", ids);
  };

  // Recalcular selección SIEMPRE que cambien estudiantes o segmentación
  useEffect(() => {
    actualizarEstudiantesSeleccionados(formData, estudiantes);
  }, [
    formData.segmento,
    formData.gradoEstudiante,
    formData.tipoEmailEstudiante,
    estudiantes,
  ]);

  // =========================
  //        HANDLERS
  // =========================
  const handleNuevaClick = () => {
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setFormData({
      asunto: "",
      mensaje: "",
      tipoCorreo: "institucional",
      segmento: "todos",
      gradoEstudiante: "todos",
      tipoEmailEstudiante: "institucional",
    });
    setEstudiantesSeleccionados([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // ya no llamamos aquí a actualizarEstudiantesSeleccionados,
    // el useEffect de arriba se encarga.
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();

    // if (estudiantesSeleccionados.length === 0) {
    //   alert(
    //     "No hay estudiantes seleccionados para esta segmentación. " +
    //     "Verifica segmento / grado / tipo de correo."
    //   );
    //   return;
    // }

    e.preventDefault();

    // Solo validamos estudiantes cuando el segmento ES estudiantes
    if (
      formData.segmento === "estudiantes" &&
      estudiantesSeleccionados.length === 0
    ) {
      alert(
        "No hay estudiantes seleccionados para esta segmentación. " +
        "Verifica segmento / grado / tipo de correo."
      );
      return;
    }

    const payload = {
      asunto: formData.asunto,
      contenido: formData.mensaje,
      tipo_correo: formData.tipoCorreo,
      tipo_email_estudiante: formData.tipoEmailEstudiante,
      segmento: formData.segmento,
      estudiantes_ids: estudiantesSeleccionados,
    };

    try {
      const res = await fetch("http://localhost:8000/api/comunicaciones/correos/enviar/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error al enviar correo:", errorData);
        alert("Error al enviar el correo.");
        return;
      }

      const nueva = await res.json(); // viene del CorreoSerializer

      // Agregamos la nueva comunicación al inicio
      setComunicaciones((prev) => [nueva, ...prev]);

      // limpiar y cerrar
      handleCancelar();
    } catch (error) {
      console.error("Error de red al enviar correo:", error);
      alert("Error de red al enviar el correo.");
    }
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
            <div className="comms-icono azul"><span className="bi bi-envelope-plus"></span></div>
            <div>
              <h2>{totalComunicaciones}</h2>
              <span>Registradas</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Correos Enviados</p>
          <div className="comms-card-body">
            <div className="comms-icono verde"><span className="bi bi-envelope-check"></span></div>
            <div>
              <h2>{totalEnviados}</h2>
              <span>Total</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Última Comunicación</p>
          <div className="comms-card-body">
            <div className="comms-icono morado"><span className="bi bi-clock-history"></span></div>
            <div>
              <h3>{ultima ? ultima.asunto : "Sin registros"}</h3>
              <span>
                {ultima
                  ? `${ultima.enviados || 0} enviados`
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
                className="btn-cancelar"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">
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
          <div key={com.id_correo} className="comms-item">
            <div className="comms-item-header">
              <div className="comms-item-icon"><span className="bi bi-envelope"></span></div>
              <div className="comms-item-info">
                <h3>{com.asunto}</h3>

                <div className="comms-tags">
                  <span className="tag tipo">
                    {com.tipo_correo || "sin tipo"}
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
                  <span>
                    <span className="bi bi-calendar3"></span> {" "}
                    {com.fecha
                      ? new Date(com.fecha).toLocaleString("es-CR")
                      : "Sin fecha"}
                  </span>
                  <span className="bi bi-envelope-check"> {com.enviados || 0} enviados</span>
                </div>
              </div>
            </div>

            <div className="comms-item-body">
              <p className="comms-label">Mensaje:</p>
              <p className="comms-mensaje">{com.mensaje}</p>

              <p className="comms-label">
                Destinatarios ({(com.estudiantes_ids || []).length}):
              </p>
              <div className="comms-destinatarios">
                {(com.estudiantes_ids || []).map((idEst, i) => (
                  <span key={i} className="chip">
                    ID Estudiante: {idEst}
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
