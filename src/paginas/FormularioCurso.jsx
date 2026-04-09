import React, { useState, useEffect } from "react";
import "../recursos/estilos/FormularioProfesor.css";
import { obtenerProfesores } from "../api/profesores";

function FormularioCurso({ onGuardar, onCancelar, datosIniciales = null }) {
  const [formData, setFormData] = useState({
    nombre: "",
    nivel_grado: "",
    año_lectivo: new Date().getFullYear(),
    horario: "",
    estado: "activo",
    id_profesor: "",
  });

  const [errores, setErrores] = useState({});
  const [profesores, setProfesores] = useState([]);
  const [cargandoProfesores, setCargandoProfesores] = useState(true);

  useEffect(() => {
    cargarProfesores();
  }, []);

  async function cargarProfesores() {
    try {
      const data = await obtenerProfesores("activos");
      setProfesores(data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
    } finally {
      setCargandoProfesores(false);
    }
  }

  useEffect(() => {
    if (datosIniciales) {
      setFormData({
        nombre: datosIniciales.nombre || "",
        nivel_grado: datosIniciales.nivel_grado || "",
        año_lectivo: datosIniciales.año_lectivo || new Date().getFullYear(),
        horario: datosIniciales.horario || "",
        estado: datosIniciales.estado || "activo",
        id_profesor: datosIniciales.id_profesor || "",
      });
    }
  }, [datosIniciales]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "año_lectivo") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };



  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre || formData.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre del curso es obligatorio";
    }

    if (!formData.nivel_grado || formData.nivel_grado.trim() === "") {
      nuevosErrores.nivel_grado = "El nivel/grado es obligatorio";
    }

    if (!formData.horario || formData.horario.trim() === "") {
      nuevosErrores.horario = "El horario es obligatorio";
    }

    if (!formData.id_profesor) {
      nuevosErrores.id_profesor = "Debe seleccionar un profesor";
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

  return (
    <div className="form-profesor">
      <p className="seccion-titulo">
        {datosIniciales ? "Editar Curso" : "Nuevo Curso"}
      </p>

      <form onSubmit={manejarSubmit}>
        <div className="campo">
          <label>Nombre del Curso *</label>
          <input
            name="nombre"
            placeholder="Ej: Matemáticas 7°"
            value={formData.nombre}
            onChange={manejarCambio}
            required
            className={errores.nombre ? "input-error" : ""}
          />
          {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
        </div>



        <div className="campo">
          <label>Nivel / Grado *</label>
          <select
            name="nivel_grado"
            value={formData.nivel_grado}
            onChange={manejarCambio}
            required
            className={errores.nivel_grado ? "input-error" : ""}
          >
            <option value="">Seleccionar grado</option>
            <option value="Cuarto">Cuarto</option>
            <option value="Quinto">Quinto</option>
          </select>
          {errores.nivel_grado && <span className="mensaje-error">{errores.nivel_grado}</span>}
        </div>



        <div className="campo">
          <label>Año Lectivo *</label>
          <input
            type="number"
            name="año_lectivo"
            placeholder="Ej: 2026"
            value={formData.año_lectivo}
            onChange={manejarCambio}
            required
            min="2000"
          />
        </div>

        <div className="campo">
          <label>Horario *</label>
          <input
            name="horario"
            placeholder="Ej: Lunes 8:00-9:40"
            value={formData.horario}
            onChange={manejarCambio}
            required
            className={errores.horario ? "input-error" : ""}
          />
          {errores.horario && <span className="mensaje-error">{errores.horario}</span>}
        </div>



        <div className="campo">
          <label>Profesor *</label>
          <select
            name="id_profesor"
            value={formData.id_profesor}
            onChange={manejarCambio}
            required
            disabled={cargandoProfesores}
            className={errores.id_profesor ? "input-error" : ""}
          >
            <option value="">
              {cargandoProfesores ? "Cargando profesores..." : "Seleccionar profesor"}
            </option>
            {profesores.map((p) => (
              <option key={p.id_profesor} value={p.id_profesor}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errores.id_profesor && <span className="mensaje-error">{errores.id_profesor}</span>}
        </div>

        {datosIniciales && (
          <div className="campo">
            <label>Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={manejarCambio}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        )}

        <div className="acciones-form">
          <button type="button" className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCurso;
