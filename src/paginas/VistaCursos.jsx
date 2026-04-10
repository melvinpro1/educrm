import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioCurso from "./FormularioCurso";
import Modal from "../componentes/ui/Modal";
import DetalleCurso from "../componentes/ui/DetalleCurso";
import {
  obtenerCursos,
  eliminarCurso,
  crearCurso,
  actualizarCurso,
} from "../api/cursos";

function VistaCursos() {
  const [modo, setModo] = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);
  const [cursoViendo, setCursoViendo] = useState(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);

  async function cargarCursos() {
    setLoading(true);
    try {
      const data = await obtenerCursos(filtroEstado);
      setCursos(data);
    } catch (err) {
      console.error("Error cargando cursos:", err);
      alert("Error cargando cursos desde el servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarCursos();
  }, [filtroEstado]);

  const filtrarPorBusqueda = (lista) =>
    lista.filter(
      (c) =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

  const cursosFiltrados = filtrarPorBusqueda(cursos);

  const manejarGuardarCurso = async (formData) => {
    if (cursoEditando) {
      const payload = {
        nombre: formData.nombre,
        nivel_grado: formData.nivel_grado,
        horario: formData.horario,
        estado: formData.estado,
        id_profesor: formData.id_profesor,
      };

      const result = await actualizarCurso(cursoEditando.id_curso, payload);

      if (!result.ok) {
        alert(result.error);
        return;
      }

      await cargarCursos();
      setModo("lista");
      setCursoEditando(null);
    } else {
      const result = await crearCurso(formData);

      if (!result.ok) {
        alert(result.error);
        return;
      }

      await cargarCursos();
      setModo("lista");
    }
  };

  const manejarCancelar = () => {
    setModo("lista");
    setCursoEditando(null);
  };

  const manejarEliminar = (curso) => {
    setCursoAEliminar(curso);
    setModalEliminarOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!cursoAEliminar) return;

    const result = await eliminarCurso(cursoAEliminar.id_curso);

    if (!result.ok) {
      alert(result.error);
      return;
    }

    await cargarCursos();
    setModalEliminarOpen(false);
    setCursoAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalEliminarOpen(false);
    setCursoAEliminar(null);
  };

  const manejarEditar = (curso) => {
    setCursoEditando(curso);
    setModo("editar");
  };

  const manejarVer = (curso) => {
    setCursoViendo(curso);
    setModalVerOpen(true);
  };

  const cerrarModalVer = () => {
    setModalVerOpen(false);
    setCursoViendo(null);
  };

  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Curso" : "Editar Curso"}</h1>
            <p>
              {modo === "nuevo"
                ? "Registre los datos del curso."
                : "Modifique los datos del curso."}
            </p>
          </div>
        </div>

        <FormularioCurso
          onGuardar={manejarGuardarCurso}
          onCancelar={manejarCancelar}
          datosIniciales={cursoEditando}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estudiantes">
        <p>Cargando cursos...</p>
      </div>
    );
  }

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
          {[
            { label: "Activos", value: "activos" },
            { label: "Inactivos", value: "inactivos" },
            { label: "Todos", value: "todos" },
          ].map((filtro) => (
            <button
              key={filtro.value}
              className={filtroEstado === filtro.value ? "activo" : ""}
              onClick={() => setFiltroEstado(filtro.value)}
            >
              {filtro.label}
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
                <span className="estado">
                  {c.estado === "activo" ? "activo" : "inactivo"}
                </span>

                <p>
                  <span className="bi bi-clock"></span> {c.horario}
                </p>
                <p>
                  <span className="bi bi-person-badge"></span> {c.profesor_nombre}
                </p>
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button
                className="btn-accion btn-ver"
                onClick={() => manejarVer(c)}
                title="Ver detalles"
              >
                <span className="bi bi-eye"></span>
              </button>
              <button
                className="btn-accion btn-editar"
                onClick={() => manejarEditar(c)}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => manejarEliminar(c)}
                title="Eliminar"
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}

        {cursosFiltrados.length === 0 && (
          <p>No se encontraron cursos.</p>
        )}
      </div>

      <Modal
        isOpen={modalVerOpen}
        onClose={cerrarModalVer}
        title={cursoViendo ? cursoViendo.nombre : "Detalles del Curso"}
      >
        {cursoViendo && <DetalleCurso curso={cursoViendo} />}
      </Modal>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar eliminación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas eliminar el curso{" "}
            <strong>{cursoAEliminar?.nombre}</strong>?
          </p>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              type="button"
              className="btn-cancelar"
              onClick={cancelarEliminar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-eliminar-modal"
              onClick={confirmarEliminar}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VistaCursos;
