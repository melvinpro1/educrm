import React, { useState, useEffect } from "react";
import "../recursos/estilos/FormularioProfesor.css";
import { obtenerProfesores } from "../api/profesores";
import { verificarCodigoCursoExistente } from "../api/cursos";

function FormularioCurso({ onGuardar, onCancelar, datosIniciales = null }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    nivel_grado: "",
    seccion: "",
    año_lectivo: new Date().getFullYear(),
    horario: "",
    cantidad_cupos: "",
    estado: "activo",
    id_profesor: "",
  });

  const [errores, setErrores] = useState({});
  const [profesores, setProfesores] = useState([]);
  const [validando, setValidando] = useState(false);
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
        codigo: datosIniciales.codigo || "",
        descripcion: datosIniciales.descripcion || "",
        nivel_grado: datosIniciales.nivel_grado || "",
        seccion: datosIniciales.seccion || "",
        año_lectivo: datosIniciales.año_lectivo || new Date().getFullYear(),
        horario: datosIniciales.horario || "",
        cantidad_cupos: datosIniciales.cantidad_cupos || "",
        estado: datosIniciales.estado || "activo",
        id_profesor: datosIniciales.id_profesor || "",
      });
    }
  }, [datosIniciales]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "codigo") {
      setErrores((prev) => {
        const e = { ...prev };
        delete e.codigo;
        return e;
      });
    }

    if (name === "cantidad_cupos" || name === "año_lectivo") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validarCodigoBlur = async (value) => {
    const nuevosErrores = { ...errores };
    if (!value) {
      nuevosErrores.codigo = "El código del curso es obligatorio";
    } else {
      setValidando(true);
      const existe = await verificarCodigoCursoExistente(value, datosIniciales?.id_curso);
      setValidando(false);
      if (existe) {
        nuevosErrores.codigo = "Este código de curso ya está registrado";
      } else {
        delete nuevosErrores.codigo;
      }
    }
    setErrores(nuevosErrores);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre || formData.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre del curso es obligatorio";
    }

    if (!formData.codigo || formData.codigo.trim() === "") {
      nuevosErrores.codigo = "El código del curso es obligatorio";
    }

    if (!formData.nivel_grado || formData.nivel_grado.trim() === "") {
      nuevosErrores.nivel_grado = "El nivel/grado es obligatorio";
    }

    if (!formData.seccion || formData.seccion.trim() === "") {
      nuevosErrores.seccion = "La sección es obligatoria";
    }

    if (!formData.horario || formData.horario.trim() === "") {
      nuevosErrores.horario = "El horario es obligatorio";
    }

    if (!formData.cantidad_cupos || formData.cantidad_cupos <= 0) {
      nuevosErrores.cantidad_cupos = "La cantidad de cupos debe ser mayor a 0";
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
          <label>Código del Curso *</label>
          <input
            name="codigo"
            placeholder="Ej: MAT-07"
            value={formData.codigo}
            onChange={manejarCambio}
            onBlur={(e) => validarCodigoBlur(e.target.value)}
            disabled={!!datosIniciales}
            required
            className={errores.codigo ? "input-error" : ""}
          />
          {errores.codigo && <span className="mensaje-error">{errores.codigo}</span>}
          {validando && <span className="mensaje-info">Verificando código...</span>}
        </div>

        <div className="campo">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            placeholder="Descripción opcional del curso"
            value={formData.descripcion}
            onChange={manejarCambio}
            rows="3"
          />
        </div>

        <div className="campo">
          <label>Nivel / Grado *</label>
          <input
            name="nivel_grado"
            placeholder="Ej: 7°, 8°, 9°"
            value={formData.nivel_grado}
            onChange={manejarCambio}
            required
            className={errores.nivel_grado ? "input-error" : ""}
          />
          {errores.nivel_grado && <span className="mensaje-error">{errores.nivel_grado}</span>}
        </div>

        <div className="campo">
          <label>Sección *</label>
          <input
            name="seccion"
            placeholder="Ej: A, B, C"
            value={formData.seccion}
            onChange={manejarCambio}
            required
            className={errores.seccion ? "input-error" : ""}
          />
          {errores.seccion && <span className="mensaje-error">{errores.seccion}</span>}
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
          <label>Cantidad de Cupos *</label>
          <input
            type="number"
            name="cantidad_cupos"
            placeholder="Ej: 30"
            value={formData.cantidad_cupos}
            onChange={manejarCambio}
            required
            min="1"
            className={errores.cantidad_cupos ? "input-error" : ""}
          />
          {errores.cantidad_cupos && (
            <span className="mensaje-error">{errores.cantidad_cupos}</span>
          )}
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
