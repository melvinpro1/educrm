import React, { useEffect, useState, useCallback } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioCurso from "./FormularioCurso";
import Modal from "../componentes/ui/Modal";
import {
  obtenerCursos, eliminarCurso, crearCurso, actualizarCurso,
  obtenerEstudiantesCurso, agregarEstudiantesCurso,
  quitarEstudianteCurso, actualizarNotaEstudiante,
} from "../api/cursos";
import { getEstudiantes } from "../api/estudiantes";

/* ─── Panel de gestión de estudiantes de un curso ─── */
function GestionarEstudiantes({ curso, onVolver }) {
  const [inscritos, setInscritos]       = useState([]);
  const [disponibles, setDisponibles]   = useState([]);
  const [busqueda, setBusqueda]         = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [notasLocales, setNotasLocales] = useState({});
  const [guardandoNota, setGuardandoNota] = useState(null);
  const [cargando, setCargando]         = useState(true);
  const [mensaje, setMensaje]           = useState(null);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    const [inscritosData, todosEstudiantes] = await Promise.all([
      obtenerEstudiantesCurso(curso.id_curso),
      getEstudiantes("activos"),
    ]);
    setInscritos(inscritosData);

    const idInscritos = new Set(inscritosData.map((i) => i.id_estudiante_pk));
    setDisponibles(todosEstudiantes.filter((e) => !idInscritos.has(e.id_estudiante)));

    const notas = {};
    inscritosData.forEach((i) => { notas[i.id_estudiante_pk] = i.nota ?? ""; });
    setNotasLocales(notas);
    setCargando(false);
  }, [curso.id_curso]);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleSeleccion = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAgregar = async () => {
    if (!seleccionados.length) return;
    const res = await agregarEstudiantesCurso(curso.id_curso, seleccionados);
    if (res.ok) {
      mostrarMensaje("ok", res.data.detail);
      setSeleccionados([]);
      await cargar();
    } else {
      mostrarMensaje("error", res.error);
    }
  };

  const handleQuitar = async (estudianteId) => {
    if (!window.confirm("¿Quitar a este estudiante del curso?")) return;
    const res = await quitarEstudianteCurso(curso.id_curso, estudianteId);
    if (res.ok) {
      await cargar();
    } else {
      mostrarMensaje("error", res.error);
    }
  };

  const handleGuardarNota = async (estudianteId) => {
    setGuardandoNota(estudianteId);
    const res = await actualizarNotaEstudiante(
      curso.id_curso,
      estudianteId,
      notasLocales[estudianteId]
    );
    setGuardandoNota(null);
    if (res.ok) {
      mostrarMensaje("ok", "Nota actualizada.");
    } else {
      mostrarMensaje("error", res.error);
    }
  };

  const disponiblesFiltrados = disponibles.filter((e) =>
    !busqueda ||
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cedula.includes(busqueda)
  );

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <button
            onClick={onVolver}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontWeight: 600, fontSize: "14px", padding: 0, marginBottom: "4px" }}
          >
            ← Volver a cursos
          </button>
          <h1>Estudiantes — {curso.nombre}</h1>
          <p>{curso.nivel_grado} · {curso.horario} · {curso.profesor_nombre}</p>
        </div>
      </div>

      {mensaje && (
        <div style={{
          padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: 500,
          background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
          color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
        }}>
          {mensaje.texto}
        </div>
      )}

      {cargando ? <p>Cargando...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Columna izquierda: inscritos */}
          <div>
            <h2 style={subtituloStyle}>
              Inscritos ({inscritos.length})
            </h2>
            {inscritos.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>Sin estudiantes inscritos aún.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {inscritos.map((i) => (
                  <div key={i.id_estudiante_pk} style={filaEstudianteStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: "14px" }}>{i.nombre}</p>
                      <p style={{ color: "#6b7280", margin: 0, fontSize: "12px" }}>{i.cedula}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="—"
                        value={notasLocales[i.id_estudiante_pk] ?? ""}
                        onChange={(e) =>
                          setNotasLocales((prev) => ({ ...prev, [i.id_estudiante_pk]: e.target.value }))
                        }
                        style={inputNotaStyle}
                      />
                      <button
                        style={btnGuardarNotaStyle}
                        onClick={() => handleGuardarNota(i.id_estudiante_pk)}
                        disabled={guardandoNota === i.id_estudiante_pk}
                        title="Guardar nota"
                      >
                        {guardandoNota === i.id_estudiante_pk ? "…" : "✓"}
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => handleQuitar(i.id_estudiante_pk)}
                        title="Quitar del curso"
                        style={{ width: "30px", height: "30px", fontSize: "13px" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha: agregar estudiantes */}
          <div>
            <h2 style={subtituloStyle}>Agregar estudiantes</h2>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "10px", fontSize: "14px", boxSizing: "border-box" }}
            />

            {disponiblesFiltrados.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                {disponibles.length === 0 ? "Todos los estudiantes ya están inscritos." : "Sin resultados."}
              </p>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "380px", overflowY: "auto" }}>
                  {disponiblesFiltrados.map((e) => (
                    <label key={e.id_estudiante} style={{ ...filaEstudianteStyle, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(e.id_estudiante)}
                        onChange={() => toggleSeleccion(e.id_estudiante)}
                        style={{ marginRight: "10px", width: "16px", height: "16px" }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: "14px" }}>{e.nombre}</p>
                        <p style={{ color: "#6b7280", margin: 0, fontSize: "12px" }}>{e.cedula}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {seleccionados.length > 0 && (
                  <button
                    className="btn-nuevo"
                    style={{ marginTop: "12px", fontSize: "14px" }}
                    onClick={handleAgregar}
                  >
                    + Agregar {seleccionados.length} estudiante(s)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Vista principal de cursos ─── */
function VistaCursos() {
  const [modo, setModo] = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [cursoGestionando, setCursoGestionando] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);

  const cargarCursos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerCursos(filtroEstado);
      setCursos(data);
    } catch (err) {
      console.error("Error cargando cursos:", err);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { cargarCursos(); }, [cargarCursos]);

  const manejarGuardarCurso = async (formData) => {
    const payload = {
      nombre:      formData.nombre,
      nivel_grado: formData.nivel_grado,
      horario:     formData.horario,
      estado:      formData.estado,
      id_profesor: formData.id_profesor,
    };

    const result = cursoEditando
      ? await actualizarCurso(cursoEditando.id_curso, payload)
      : await crearCurso(payload);

    if (!result.ok) { alert(result.error); return; }

    await cargarCursos();
    setModo("lista");
    setCursoEditando(null);
  };

  const confirmarEliminar = async () => {
    if (!cursoAEliminar) return;
    const result = await eliminarCurso(cursoAEliminar.id_curso);
    if (!result.ok) { alert(result.error); return; }
    await cargarCursos();
    setModalEliminarOpen(false);
    setCursoAEliminar(null);
  };

  const cursosFiltrados = cursos.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Vista: gestionar estudiantes
  if (modo === "estudiantes" && cursoGestionando) {
    return (
      <GestionarEstudiantes
        curso={cursoGestionando}
        onVolver={() => { setModo("lista"); setCursoGestionando(null); }}
      />
    );
  }

  // Vista: formulario
  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Curso" : "Editar Curso"}</h1>
            <p>{modo === "nuevo" ? "Registre los datos del curso." : "Modifique los datos del curso."}</p>
          </div>
        </div>
        <FormularioCurso
          onGuardar={manejarGuardarCurso}
          onCancelar={() => { setModo("lista"); setCursoEditando(null); }}
          datosIniciales={cursoEditando}
        />
      </div>
    );
  }

  if (loading) return <div className="estudiantes"><p>Cargando cursos...</p></div>;

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Cursos</h1>
          <p>Administre los cursos del CCSP</p>
        </div>
        <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
          + Nuevo Curso
        </button>
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="filtro-niveles">
          {[{ label: "Activos", value: "activos" }, { label: "Inactivos", value: "inactivos" }, { label: "Todos", value: "todos" }].map((f) => (
            <button key={f.value} className={filtroEstado === f.value ? "activo" : ""} onClick={() => setFiltroEstado(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="estudiantes-grid">
        {cursosFiltrados.map((c) => (
          <div key={c.id_curso} className="tarjeta-estudiante">
            <div className="tarjeta-contenido">
              <div className="tarjeta-header">
                <div className="tarjeta-icono">
                  <span className="bi bi-book"></span>
                </div>
                <div>
                  <h3>{c.nombre}</h3>
                </div>
              </div>
              <div className="tarjeta-detalle">
                <span className="nivel verde">{c.nivel_grado}</span>
                <span className="estado">{c.estado}</span>
                <p><span className="bi bi-clock"></span> {c.horario}</p>
                <p><span className="bi bi-person-badge"></span> {c.profesor_nombre}</p>
                <p style={{ marginTop: "4px", fontSize: "13px", color: "#1d4ed8", fontWeight: 600 }}>
                  <span className="bi bi-people-fill"></span> {c.total_estudiantes} estudiante(s)
                </p>
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button
                className="btn-accion btn-ver"
                title="Gestionar estudiantes"
                onClick={() => { setCursoGestionando(c); setModo("estudiantes"); }}
              >
                <span className="bi bi-people"></span>
              </button>
              <button
                className="btn-accion btn-editar"
                onClick={() => { setCursoEditando(c); setModo("editar"); }}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => { setCursoAEliminar(c); setModalEliminarOpen(true); }}
                title="Eliminar"
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}

        {cursosFiltrados.length === 0 && <p>No se encontraron cursos.</p>}
      </div>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={() => { setModalEliminarOpen(false); setCursoAEliminar(null); }}
        title="Confirmar eliminación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas eliminar el curso <strong>{cursoAEliminar?.nombre}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn-cancelar" onClick={() => { setModalEliminarOpen(false); setCursoAEliminar(null); }}>
              Cancelar
            </button>
            <button type="button" className="btn-eliminar-modal" onClick={confirmarEliminar}>
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const subtituloStyle = {
  fontSize: "15px", fontWeight: 700, color: "#374151",
  margin: "0 0 12px", paddingBottom: "6px", borderBottom: "2px solid #e2e8f0",
};

const filaEstudianteStyle = {
  display: "flex", alignItems: "center", padding: "10px 12px",
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
};

const inputNotaStyle = {
  width: "60px", padding: "4px 6px", borderRadius: "6px",
  border: "1px solid #d1d5db", textAlign: "center", fontSize: "14px",
};

const btnGuardarNotaStyle = {
  background: "#059669", color: "#fff", border: "none",
  borderRadius: "6px", padding: "4px 8px", cursor: "pointer",
  fontWeight: 700, fontSize: "14px",
};

export default VistaCursos;
