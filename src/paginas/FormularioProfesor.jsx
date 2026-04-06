import React, { useState, useEffect } from "react";
import "../recursos/estilos/FormularioProfesor.css";
import { formatCedula, validarCedula } from "../utils/validaciones";
import { verificarCedulaProfesorExistente } from "../api/profesores";

function FormularioProfesor({ onGuardar, onCancelar, datosIniciales = null }) {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    correo: "",
    telefono: "",
    activo: true,
  });
  const [errores, setErrores] = useState({});
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    if (datosIniciales) {
      setFormData({
        cedula: datosIniciales.cedula || "",
        nombre: datosIniciales.nombre || "",
        correo: datosIniciales.correo || "",
        telefono: datosIniciales.telefono || "",
        activo: datosIniciales.activo ?? true,
      });
    }
  }, [datosIniciales]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    let nuevoValor = type === "checkbox" ? checked : value;

    if (name === "cedula") {
      nuevoValor = formatCedula(value);
      setErrores((prev) => { const e = { ...prev }; delete e.cedula; return e; });
    }

    setFormData((prev) => ({ ...prev, [name]: nuevoValor }));
  };

  const validarCedulaBlur = async (value) => {
    const nuevosErrores = { ...errores };
    if (!value) {
      nuevosErrores.cedula = "La cédula es obligatoria";
    } else if (!validarCedula(value)) {
      nuevosErrores.cedula = "Formato de cédula inválido (#-####-####)";
    } else {
      setValidando(true);
      const existe = await verificarCedulaProfesorExistente(value, datosIniciales?.id_profesor);
      setValidando(false);
      if (existe) {
        nuevosErrores.cedula = "Esta cédula ya está registrada";
      } else {
        delete nuevosErrores.cedula;
      }
    }
    setErrores(nuevosErrores);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="form-profesor">
      <p className="seccion-titulo">
        {datosIniciales ? "Editar Profesor" : "Nuevo Profesor"}
      </p>

      <form onSubmit={manejarSubmit}>
        <div className="campo">
          <label>Cédula *</label>
          <input
            name="cedula"
            placeholder="#-####-####"
            value={formData.cedula}
            onChange={manejarCambio}
            onBlur={(e) => validarCedulaBlur(e.target.value)}
            disabled={!!datosIniciales}
            required
            className={errores.cedula ? "input-error" : ""}
          />
          {errores.cedula && <span className="mensaje-error">{errores.cedula}</span>}
          {validando && <span className="mensaje-info">Verificando cédula...</span>}
        </div>

        <div className="campo">
          <label>Nombre</label>
          <input
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={manejarCambio}
            disabled={!!datosIniciales}
            required
          />
        </div>

        <div className="campo">
          <label>Correo</label>
          <input
            name="correo"
            placeholder="correo@ejemplo.com"
            value={formData.correo}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="campo">
          <label>Teléfono</label>
          <input
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={manejarCambio}
          />
        </div>

        {datosIniciales && (
          <label className="campo campo-checkbox">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={manejarCambio}
            />
            Activo
          </label>
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

export default FormularioProfesor;