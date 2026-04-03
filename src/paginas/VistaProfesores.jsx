import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioProfesor from "./FormularioProfesor";
import Modal from "../componentes/ui/Modal";
import {
  obtenerProfesores,
  eliminarProfesor,
  crearProfesor,
  actualizarProfesor,
} from "../api/profesores";

function VistaProfesores() {
  const [modo, setModo] = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profesorEditando, setProfesorEditando] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [profesorAEliminar, setProfesorAEliminar] = useState(null);

  async function cargarProfesores() {
    setLoading(true);
    try {
      const data = await obtenerProfesores(filtroEstado);
      setProfesores(data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
      alert("Error cargando profesores desde el servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  const cargarProfesores = async () => {
    try {
      setLoading(true);
      const data = await obtenerProfesores(filtroEstado);
      setProfesores(data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
      alert("Error cargando profesores desde el servidor");
    } finally {
      setLoading(false);
    }
  };

  cargarProfesores();
}, [filtroEstado]);

  const filtrarPorBusqueda = (lista) =>
    lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.cedula && p.cedula.includes(busqueda))
    );

  const profesoresFiltrados = filtrarPorBusqueda(profesores);

  const manejarGuardarProfesor = async (formData) => {
    if (profesorEditando) {
      const payload = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        activo: formData.activo,
      };

      const result = await actualizarProfesor(
        profesorEditando.id_profesor,
        payload
      );

      if (!result.ok) {
        alert(result.error);
        return;
      }

      await cargarProfesores();
      setModo("lista");
      setProfesorEditando(null);
    } else {
      const result = await crearProfesor(formData);

      if (!result.ok) {
        alert(result.error);
        return;
      }

      await cargarProfesores();
      setModo("lista");
    }
  };

  const manejarCancelar = () => {
    setModo("lista");
    setProfesorEditando(null);
  };

  const manejarEliminar = (profesor) => {
    setProfesorAEliminar(profesor);
    setModalEliminarOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!profesorAEliminar) return;

    const result = await eliminarProfesor(profesorAEliminar.id_profesor);

    if (!result.ok) {
      alert(result.error);
      return;
    }

    await cargarProfesores();
    setModalEliminarOpen(false);
    setProfesorAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalEliminarOpen(false);
    setProfesorAEliminar(null);
  };

  const manejarEditar = (profesor) => {
    setProfesorEditando(profesor);
    setModo("editar");
  };

  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Profesor" : "Editar Profesor"}</h1>
            <p>
              {modo === "nuevo"
                ? "Registre los datos del profesor."
                : "Modifique los datos del profesor."}
            </p>
          </div>
        </div>

        <FormularioProfesor
          onGuardar={manejarGuardarProfesor}
          onCancelar={manejarCancelar}
          datosIniciales={profesorEditando}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estudiantes">
        <p>Cargando profesores...</p>
      </div>
    );
  }

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Profesores</h1>
          <p>Administre la información de los profesores del CCSP</p>
        </div>
        <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
          + Nuevo Profesor
        </button>
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
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
        {profesoresFiltrados.map((p) => (
          <div key={p.id_profesor} className="tarjeta-estudiante">
            <div className="tarjeta-contenido">
              <div className="tarjeta-header">
                <div className="tarjeta-icono">
                  <span className="bi bi-person-badge"></span>
                </div>
                <div>
                  <h3>{p.nombre}</h3>
                  <p className="cedula">{p.cedula}</p>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <span className="nivel verde">Profesor</span>
                <span className="estado">
                  {p.activo ? "activo" : "inactivo"}
                </span>

                <p>
                  <span className="bi bi-envelope-fill"></span> {p.correo}
                </p>
                {p.telefono && (
                  <p>
                    <span className="bi bi-telephone-fill"></span> {p.telefono}
                  </p>
                )}
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button
                className="btn-accion btn-editar"
                onClick={() => manejarEditar(p)}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => manejarEliminar(p)}
                title="Eliminar"
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}

        {profesoresFiltrados.length === 0 && (
          <p>No se encontraron profesores.</p>
        )}
      </div>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar eliminación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas eliminar al profesor{" "}
            <strong>{profesorAEliminar?.nombre}</strong>?
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

export default VistaProfesores;