// 📁 src/paginas/FormularioEncargado.jsx
// Formulario para registrar/editar Encargado.

import React, { useState, useEffect } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import { 
  formatTelefono, 
  validarTelefono, 
  validarEmail
} from "../utils/validaciones";

function FormularioEncargado({ onGuardar, onCancelar, datosIniciales = null }) {
  // 🔹 Estado para los campos del encargado
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  });

  // 🔹 Estado para errores de validación
  const [errores, setErrores] = useState({});

  // 🔹 Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (datosIniciales) {
      setFormulario({
        nombre: datosIniciales.nombre || "",
        correo: datosIniciales.correo || "",
        telefono: datosIniciales.telefono || "",
      });
    }
  }, [datosIniciales]);

  // Manejar cambios con formateo automático
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    let nuevosErrores = { ...errores };

    // Formatear teléfono automáticamente
    if (name === 'telefono') {
      nuevoValor = formatTelefono(value);
      delete nuevosErrores.telefono;
    } else if (name === 'correo') {
      delete nuevosErrores.correo;
    } else if (name === 'nombre') {
      delete nuevosErrores.nombre;
    }

    setFormulario((prev) => ({ ...prev, [name]: nuevoValor }));
    setErrores(nuevosErrores);
  };

  // Validar campo individual al perder foco
  const validarCampo = (name, value) => {
    const nuevosErrores = { ...errores };

    switch(name) {
      case 'nombre':
        if (!value.trim()) {
          nuevosErrores.nombre = 'El nombre es obligatorio';
        } else {
          delete nuevosErrores.nombre;
        }
        break;

      case 'correo':
        if (!value) {
          nuevosErrores.correo = 'El correo es obligatorio';
        } else if (!validarEmail(value)) {
          nuevosErrores.correo = 'Formato de correo inválido';
        } else {
          delete nuevosErrores.correo;
        }
        break;

      case 'telefono':
        if (!value) {
          nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (!validarTelefono(value)) {
          nuevosErrores.telefono = 'Formato de teléfono inválido (####-####)';
        } else {
          delete nuevosErrores.telefono;
        }
        break;

      default:
        break;
    }

    setErrores(nuevosErrores);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos
    const nuevosErrores = {};

    // Validar nombre
    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    // Validar correo
    if (!formulario.correo) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!validarEmail(formulario.correo)) {
      nuevosErrores.correo = 'Formato de correo inválido';
    }

    // Validar teléfono
    if (!formulario.telefono) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!validarTelefono(formulario.telefono)) {
      nuevosErrores.telefono = 'Formato de teléfono inválido (####-####)';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      alert('Por favor corrija los errores en el formulario');
      return;
    }

    // Pasar los datos al padre
    if (onGuardar) {
      onGuardar(formulario);
    }

    // Limpiar formulario si es nuevo (no edición)
    if (!datosIniciales) {
      setFormulario({
        nombre: "",
        correo: "",
        telefono: "",
      });
      setErrores({});
    }
  };

  return (
    <form className="form-estudiante" onSubmit={manejarSubmit}>
      {/* ================= DATOS DEL ENCARGADO ================= */}
      <h2 className="seccion-titulo">
        {datosIniciales ? "Editar Encargado" : "Datos del Encargado"}
      </h2>

      <div className="fila">
        <div className="campo">
          <label>Nombre Completo *</label>
          <input
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('nombre', e.target.value)}
            required
            placeholder="Ej: María González Ramírez"
            className={errores.nombre ? 'input-error' : ''}
          />
          {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Correo Electrónico *</label>
          <input
            type="email"
            name="correo"
            value={formulario.correo}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('correo', e.target.value)}
            required
            disabled={!!datosIniciales} // No permitir cambiar correo en edición (es único)
            placeholder="Ej: maria.gonzalez@correo.com"
            className={errores.correo ? 'input-error' : ''}
          />
          {errores.correo && <span className="mensaje-error">{errores.correo}</span>}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Teléfono *</label>
          <input
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('telefono', e.target.value)}
            required
            placeholder="####-####"
            className={errores.telefono ? 'input-error' : ''}
          />
          {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
        </div>
      </div>

      {/* Información adicional para modo edición */}
      {datosIniciales && (
        <div className="info-edicion">
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
            ℹ️ <strong>Nota:</strong> Al modificar este encargado, los cambios se
            aplicarán a todos los estudiantes asociados.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="acciones-form">
        <button type="button" className="btn-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-guardar"
          disabled={Object.keys(errores).length > 0}
        >
          {datosIniciales ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default FormularioEncargado;
