//src/paginas/Comunicaciones.jsx
// Vista principal del Sistema de Comunicaciones.
// Muestra estadísticas y un historial de comunicaciones registradas.

import React, { useState, useEffect, useRef } from "react";
import "../recursos/estilos/VistaComunicacion.css";

// NUEVO: Función para crear FormData con archivos
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

function crearFormData(datos, archivos) {
  const formData = new FormData();
  
  // Agregar datos de texto
  formData.append('asunto', datos.asunto);
  formData.append('contenido', datos.contenido);
  formData.append('tipo_correo', datos.tipo_correo);
  formData.append('tipo_email_estudiante', datos.tipo_email_estudiante);
  formData.append('segmento', datos.segmento);
  
  // Agregar IDs de estudiantes
  datos.estudiantes_ids.forEach((id) => {
    formData.append('estudiantes_ids', id);
  });
  
  // Agregar archivos
  archivos.forEach((archivo) => {
    formData.append('adjuntos', archivo);
  });
  
  return formData;
}

function Comunicaciones() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [comunicaciones, setComunicaciones] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dragActivo, setDragActivo] = useState(false);
  const [errorArchivos, setErrorArchivos] = useState("");

  const [formData, setFormData] = useState({
    asunto: "",
    mensaje: "",
    tipoCorreo: "institucional",
    segmento: "todos",        // todos | estudiantes | encargados
    gradoEstudiante: "todos", // cuartos | quintos | todos
    tipoEmailEstudiante: "institucional", // institucional | personal | ambos
    adjuntos: [], // NUEVO: archivos adjuntos
  });

  // IDs de estudiantes a los que se enviará el correo
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  
  // NUEVO: Referencia al input file para limpiar después
  const inputFileRef = useRef(null);

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
        const res = await fetch(`${API_BASE}/comunicaciones/correos/`, {
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
        const res = await fetch(`${API_BASE}/estudiantes/?estado=activos`, {
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
    // Solo encargados: no necesitamos IDs de estudiantes
    if (config.segmento === "encargados") {
      setEstudiantesSeleccionados([]);
      return;
    }

    // Para "estudiantes" y "todos" seleccionamos estudiantes activos
    let filtrados = [...listaEstudiantes];

    // Filtro por grado solo aplica cuando el segmento es "estudiantes"
    if (config.segmento === "estudiantes") {
      if (config.gradoEstudiante === "cuartos") {
        filtrados = filtrados.filter((est) =>
          est.grado?.toLowerCase().includes("cuarto")
        );
      } else if (config.gradoEstudiante === "quintos") {
        filtrados = filtrados.filter((est) =>
          est.grado?.toLowerCase().includes("quinto")
        );
      }
    }

    const ids = filtrados.map((est) => est.id_estudiante);
    setEstudiantesSeleccionados(ids);
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
      adjuntos: [], // NUEVO: limpiar adjuntos
    });
    setEstudiantesSeleccionados([]);
    setErrorArchivos("");
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
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

  // NUEVO: Manejar subida de archivos (agregar, no reemplazar)
  const procesarArchivos = (files) => {
  const newFiles = Array.from(files);
  const MAX_ARCHIVOS = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const formatosPermitidos = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "image/gif",
  ];

  setErrorArchivos("");

  setFormData((prev) => {
    const nombresExistentes = new Set(prev.adjuntos.map((f) => f.name));

    const sinDuplicados = newFiles.filter((f) => !nombresExistentes.has(f.name));

    const validos = sinDuplicados.filter((file) => {
      if (!formatosPermitidos.includes(file.type)) {
        setErrorArchivos("Uno o más archivos tienen un formato no permitido.");
        return false;
      }
      if (file.size > MAX_SIZE) {
        setErrorArchivos("Uno o más archivos superan el tamaño máximo de 10 MB.");
        return false;
      }
      return true;
    });

    const totalFinal = [...prev.adjuntos, ...validos];

    if (totalFinal.length > MAX_ARCHIVOS) {
      setErrorArchivos("Solo puedes adjuntar un máximo de 5 archivos.");
      return prev;
    }

    return {
      ...prev,
      adjuntos: totalFinal,
    };
  });

  if (inputFileRef.current) {
    inputFileRef.current.value = "";
  }
};

const handleFileChange = (e) => {
  procesarArchivos(e.target.files);
};
const handleDragOver = (e) => {
  e.preventDefault();
  setDragActivo(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  setDragActivo(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  setDragActivo(false);
  procesarArchivos(e.dataTransfer.files);
};

  // NUEVO: Eliminar archivo seleccionado
  const handleRemoveFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((_, idx) => idx !== indexToRemove),
    }));
    // Limpiar el input file para permitir nuevas selecciones
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
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
      // NUEVO: Se enviarán como multipart/form-data
    };

    try {
      const res = await fetch(`${API_BASE}/comunicaciones/correos/enviar/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // NO agregar Content-Type: header, dejar que el navegador lo calcule
        },
        body: crearFormData(payload, formData.adjuntos), // NUEVO: FormData
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
            <div className="comms-icono azul"><span className="bi bi-envelope"></span></div>
            <div>
              <h2>{totalComunicaciones}</h2>
              <span>Registradas</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Correos Enviados</p>
          <div className="comms-card-body">
            <div className="comms-icono verde"><span className="bi bi-send"></span></div>
            <div>
              <h2>{totalEnviados}</h2>
              <span>Total</span>
            </div>
          </div>
        </div>

        <div className="comms-card">
          <p className="comms-card-titulo">Última Comunicación</p>
          <div className="comms-card-body">
            <div className="comms-icono morado"><span className="bi bi-clock"></span></div>
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

            {/* Campo para adjuntos */}
            <div className="campo">
  <label>Adjuntar Archivos (Opcional)</label>

  <div
    className={`drop-zone ${dragActivo ? "activo" : ""}`}
    onClick={() => inputFileRef.current?.click()}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    <input
      ref={inputFileRef}
      className="input-archivo-oculto"
      type="file"
      multiple
      onChange={handleFileChange}
      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
    />

    <div className="drop-zone-content">
      <div className="icono-adjunto">
     <i className="bi bi-file-earmark-arrow-up"></i>
</div>
      <p>
        <strong>Haz clic o arrastra archivos aquí</strong>
      </p>
      <small>
        Formatos permitidos: PDF, Word, Excel, PNG, JPG, GIF
      </small>
      <small className="limite-archivos">
        Máximo 5 archivos, 10 MB por archivo
      </small>
    </div>
  </div>

  {errorArchivos && <p className="error-archivos">{errorArchivos}</p>}

  {formData.adjuntos.length > 0 && (
    <div className="lista-archivos">
      {formData.adjuntos.map((archivo, idx) => (
        <div key={idx} className="archivo-card">
          <div className="archivo-info">
            <span className="archivo-icono">
            <i
              className={
                archivo.type.includes("pdf")
                  ? "bi bi-file-earmark-pdf"
                  : archivo.type.includes("image")
                  ? "bi bi-image"
                  : archivo.type.includes("word")
                  ? "bi bi-file-earmark-word"
                  : archivo.type.includes("excel") ||
                    archivo.name.endsWith(".xls") ||
                    archivo.name.endsWith(".xlsx")
                  ? "bi bi-file-earmark-excel"
                  : "bi bi-paperclip"
              }
            ></i>
          </span>

            <div>
              <p>{archivo.name}</p>
              <small>{(archivo.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
          </div>

          <button
            type="button"
            className="btn-eliminar-archivo"
            onClick={() => handleRemoveFile(idx)}
            title="Eliminar archivo"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
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
                    <span className="bi bi-calendar3"></span>{" "}
                    {com.fecha
                      ? new Date(com.fecha).toLocaleString("es-CR")
                      : "Sin fecha"}
                  </span>
                  <span>
                    <span className="bi bi-envelope-check"></span>{" "}
                    {com.enviados || 0} correos enviados
                  </span>
                </div>
              </div>
            </div>

            <div className="comms-item-body">
              <p className="comms-label">Mensaje:</p>
              <p className="comms-mensaje">{com.mensaje}</p>

              <p className="comms-label">Destinatarios:</p>
              <div className="comms-destinatarios">
                {com.segmento === "estudiantes" && (
                  <span className="chip">
                    <span className="bi bi-mortarboard-fill"></span>{" "}
                    {(com.estudiantes_ids || []).length} estudiante(s)
                  </span>
                )}
                {com.segmento === "encargados" && (
                  <span className="chip">
                    <span className="bi bi-people-fill"></span>{" "}
                    Encargados activos
                  </span>
                )}
                {com.segmento === "todos" && (
                  <>
                    <span className="chip">
                      <span className="bi bi-mortarboard-fill"></span>{" "}
                      {(com.estudiantes_ids || []).length} estudiante(s)
                    </span>
                    <span className="chip">
                      <span className="bi bi-people-fill"></span>{" "}
                      Encargados activos
                    </span>
                  </>
                )}
                {!com.segmento && (
                  <span className="chip">
                    {(com.estudiantes_ids || []).length} destinatario(s)
                  </span>
                )}
              </div>

              {com.adjuntos && com.adjuntos.length > 0 && (
              <div className="bloque-adjuntos">
                <p className="comms-label">
                  Adjuntos ({com.adjuntos.length}):
                </p>

                <div className="comms-adjuntos">
                  {com.adjuntos.map((adj, i) => (
                    <a 
                      key={i} 
                      href={adj.archivo}
                      download={adj.nombre_original}
                      className="chip-adjunto"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i
                        className={
                          adj.nombre_original.toLowerCase().endsWith(".pdf")
                            ? "bi bi-file-earmark-pdf"
                            : /\.(jpg|jpeg|png|gif)$/i.test(adj.nombre_original)
                            ? "bi bi-image"
                            : /\.(doc|docx)$/i.test(adj.nombre_original)
                            ? "bi bi-file-earmark-word"
                            : /\.(xls|xlsx)$/i.test(adj.nombre_original)
                            ? "bi bi-file-earmark-excel"
                            : "bi bi-paperclip"
                        }
                      ></i>
                      {adj.nombre_original}
                    </a>
                  ))}
                </div>
              </div>
            )}
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
