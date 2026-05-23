import React, { useState, useEffect } from "react";
import "../recursos/estilos/FormularioProfesor.css";
import { obtenerActivos } from "../api/activos";
import { getEstudiantes } from "../api/estudiantes";

function FormularioPrestamo({ onGuardar, onCancelar, activoPreseleccionado = null }) {
  const hoy = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    id_activo: activoPreseleccionado?.id_activo || "",
    id_estudiante: "",
    fecha_prestamo: hoy,
    fecha_retorno_esperada: "",
  });
  const [errores, setErrores] = useState({});
  const [activos, setActivos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [dataActivos, dataEstudiantes] = await Promise.all([
          obtenerActivos({ estado: "disponible" }),
          getEstudiantes("todos"),
        ]);
        setActivos(dataActivos);
        setEstudiantes(dataEstudiantes);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const estudiantesFiltrados = estudiantes.filter((e) => {
    const q = busquedaEstudiante.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(q) ||
      (e.cedula && e.cedula.toLowerCase().includes(q))
    );
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.id_activo) {
      nuevosErrores.id_activo = "Debe seleccionar un activo";
    }
    if (!formData.id_estudiante) {
      nuevosErrores.id_estudiante = "Debe seleccionar un estudiante";
    }
    if (!formData.fecha_prestamo) {
      nuevosErrores.fecha_prestamo = "La fecha de préstamo es obligatoria";
    }
    if (!formData.fecha_retorno_esperada) {
      nuevosErrores.fecha_retorno_esperada = "La fecha de retorno es obligatoria";
    } else if (
      formData.fecha_prestamo &&
      formData.fecha_retorno_esperada <= formData.fecha_prestamo
    ) {
      nuevosErrores.fecha_retorno_esperada =
        "La fecha de retorno debe ser posterior a la fecha de préstamo";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onGuardar(formData);
    }
  };

  if (cargando) {
    return <p style={{ padding: "16px" }}>Cargando datos...</p>;
  }

  return (
    <div className="form-profesor">
      <p className="seccion-titulo">Registrar Préstamo</p>

      <form onSubmit={manejarSubmit}>
        <div className="campo">
          <label>Activo *</label>
          <select
            name="id_activo"
            value={formData.id_activo}
            onChange={manejarCambio}
            disabled={!!activoPreseleccionado}
            className={errores.id_activo ? "input-error" : ""}
          >
            <option value="">Seleccionar activo disponible</option>
            {activos.map((a) => (
              <option key={a.id_activo} value={a.id_activo}>
                {a.nombre} ({a.tipo})
              </option>
            ))}
          </select>
          {errores.id_activo && (
            <span className="mensaje-error">{errores.id_activo}</span>
          )}
          {activos.length === 0 && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              No hay activos disponibles para préstamo.
            </span>
          )}
        </div>

        <div className="campo">
          <label>Buscar estudiante</label>
          <input
            type="text"
            placeholder="Filtrar por nombre o cédula..."
            value={busquedaEstudiante}
            onChange={(e) => setBusquedaEstudiante(e.target.value)}
          />
        </div>

        <div className="campo">
          <label>Estudiante *</label>
          <select
            name="id_estudiante"
            value={formData.id_estudiante}
            onChange={manejarCambio}
            className={errores.id_estudiante ? "input-error" : ""}
            size={estudiantesFiltrados.length > 0 ? Math.min(estudiantesFiltrados.length + 1, 6) : 2}
            style={{ height: "auto" }}
          >
            <option value="">— Seleccionar —</option>
            {estudiantesFiltrados.map((e) => (
              <option key={e.id_estudiante} value={e.id_estudiante}>
                {e.nombre} {e.cedula ? `(${e.cedula})` : ""}
              </option>
            ))}
          </select>
          {errores.id_estudiante && (
            <span className="mensaje-error">{errores.id_estudiante}</span>
          )}
        </div>

        <div className="campo">
          <label>Fecha de préstamo *</label>
          <input
            type="date"
            name="fecha_prestamo"
            value={formData.fecha_prestamo}
            onChange={manejarCambio}
            className={errores.fecha_prestamo ? "input-error" : ""}
          />
          {errores.fecha_prestamo && (
            <span className="mensaje-error">{errores.fecha_prestamo}</span>
          )}
        </div>

        <div className="campo">
          <label>Fecha de retorno esperada *</label>
          <input
            type="date"
            name="fecha_retorno_esperada"
            value={formData.fecha_retorno_esperada}
            onChange={manejarCambio}
            min={formData.fecha_prestamo || hoy}
            className={errores.fecha_retorno_esperada ? "input-error" : ""}
          />
          {errores.fecha_retorno_esperada && (
            <span className="mensaje-error">{errores.fecha_retorno_esperada}</span>
          )}
        </div>

        <div className="acciones-form">
          <button type="button" className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Registrar Préstamo
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioPrestamo;
