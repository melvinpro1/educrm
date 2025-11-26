// 📁 src/paginas/FormularioEstudiante.jsx
// Formulario para registrar/editar Estudiante + Encargado al mismo tiempo.

import React, { useState, useEffect } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import { 
  formatCedula, 
  formatTelefono, 
  validarCedula, 
  validarTelefono, 
  validarEmail,
  extraerNumeros
} from "../utils/validaciones";
import { verificarCedulaExistente } from "../api/estudiantes";

function FormularioEstudiante({ onGuardar, onCancelar, datosIniciales = null }) {
  // 🔹 Estado único para todos los campos
  const [formulario, setFormulario] = useState({
    // Estudiante
    cedula: "",
    nombre: "",
    correoInstitucional: "",
    correoPersonal: "",
    telefono: "",
    colegioProcedencia: "",
    grado: "Cuarto Nivel",
    direccion: "",
    // Encargado (obligatorio)
    nombreEncargado: "",
    correoEncargado: "",
    telefonoEncargado: "",
  });

  const [errores, setErrores] = useState({});
  const [validando, setValidando] = useState(false);

  // 🔹 Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (datosIniciales) {
      setFormulario({
        cedula: datosIniciales.cedula || "",
        nombre: datosIniciales.nombre || "",
        correoInstitucional: datosIniciales.correo_institucional || "",
        correoPersonal: datosIniciales.correo_personal || "",
        telefono: datosIniciales.telefono || "",
        colegioProcedencia: datosIniciales.colegio_procedencia || "",
        grado: datosIniciales.grado || "Cuarto Nivel",
        direccion: datosIniciales.direccion_domicilio || "",
        // Encargado
        nombreEncargado: datosIniciales.encargado?.nombre || "",
        correoEncargado: datosIniciales.encargado?.correo || "",
        telefonoEncargado: datosIniciales.encargado?.telefono || "",
      });
    }
  }, [datosIniciales]);

  // Manejar cambios con formateo automático
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    let nuevosErrores = { ...errores };

    // Formatear campos según tipo
    if (name === 'cedula') {
      nuevoValor = formatCedula(value);
      delete nuevosErrores.cedula;
    } else if (name === 'telefono' || name === 'telefonoEncargado') {
      nuevoValor = formatTelefono(value);
      delete nuevosErrores[name];
    } else if (name === 'correoInstitucional' || name === 'correoPersonal' || name === 'correoEncargado') {
      delete nuevosErrores[name];
    }

    setFormulario((prev) => ({ ...prev, [name]: nuevoValor }));
    setErrores(nuevosErrores);
  };

  // Validar campo individual al perder foco
  const validarCampo = async (name, value) => {
    const nuevosErrores = { ...errores };

    switch(name) {
      case 'cedula':
        if (!value) {
          nuevosErrores.cedula = 'La cédula es obligatoria';
        } else if (!validarCedula(value)) {
          nuevosErrores.cedula = 'Formato de cédula inválido (#-####-####)';
        } else {
          // Verificar si ya existe
          setValidando(true);
          const existe = await verificarCedulaExistente(
            value, 
            datosIniciales?.id_estudiante
          );
          setValidando(false);
          if (existe) {
            nuevosErrores.cedula = 'Esta cédula ya está registrada';
          } else {
            delete nuevosErrores.cedula;
          }
        }
        break;

      case 'correoInstitucional':
        if (!value) {
          nuevosErrores.correoInstitucional = 'El correo institucional es obligatorio';
        } else if (!validarEmail(value)) {
          nuevosErrores.correoInstitucional = 'Formato de correo inválido';
        } else if (formulario.correoPersonal && value === formulario.correoPersonal) {
          nuevosErrores.correoInstitucional = 'Los correos deben ser diferentes';
        } else {
          delete nuevosErrores.correoInstitucional;
        }
        break;

      case 'correoPersonal':
        if (value && !validarEmail(value)) {
          nuevosErrores.correoPersonal = 'Formato de correo inválido';
        } else if (value && value === formulario.correoInstitucional) {
          nuevosErrores.correoPersonal = 'Los correos deben ser diferentes';
        } else {
          delete nuevosErrores.correoPersonal;
        }
        break;

      case 'correoEncargado':
        if (!value) {
          nuevosErrores.correoEncargado = 'El correo del encargado es obligatorio';
        } else if (!validarEmail(value)) {
          nuevosErrores.correoEncargado = 'Formato de correo inválido';
        } else {
          delete nuevosErrores.correoEncargado;
        }
        break;

      case 'telefono':
        if (value && !validarTelefono(value)) {
          nuevosErrores.telefono = 'Formato de teléfono inválido (####-####)';
        } else {
          delete nuevosErrores.telefono;
        }
        break;

      case 'telefonoEncargado':
        if (value && !validarTelefono(value)) {
          nuevosErrores.telefonoEncargado = 'Formato de teléfono inválido (####-####)';
        } else {
          delete nuevosErrores.telefonoEncargado;
        }
        break;

      default:
        break;
    }

    setErrores(nuevosErrores);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const nuevosErrores = {};

    // Validar cédula
    if (!formulario.cedula) {
      nuevosErrores.cedula = 'La cédula es obligatoria';
    } else if (!validarCedula(formulario.cedula)) {
      nuevosErrores.cedula = 'Formato de cédula inválido (#-####-####)';
    }

    // Validar correos
    if (!formulario.correoInstitucional) {
      nuevosErrores.correoInstitucional = 'El correo institucional es obligatorio';
    } else if (!validarEmail(formulario.correoInstitucional)) {
      nuevosErrores.correoInstitucional = 'Formato de correo inválido';
    }

    if (formulario.correoPersonal) {
      if (!validarEmail(formulario.correoPersonal)) {
        nuevosErrores.correoPersonal = 'Formato de correo inválido';
      } else if (formulario.correoPersonal === formulario.correoInstitucional) {
        nuevosErrores.correoPersonal = 'Los correos deben ser diferentes';
      }
    }

    // Validar teléfonos
    if (formulario.telefono && !validarTelefono(formulario.telefono)) {
      nuevosErrores.telefono = 'Formato de teléfono inválido (####-####)';
    }

    if (formulario.telefonoEncargado && !validarTelefono(formulario.telefonoEncargado)) {
      nuevosErrores.telefonoEncargado = 'Formato de teléfono inválido (####-####)';
    }

    // Validar encargado
    if (!formulario.nombreEncargado) {
      nuevosErrores.nombreEncargado = 'El nombre del encargado es obligatorio';
    }
    if (!formulario.correoEncargado) {
      nuevosErrores.correoEncargado = 'El correo del encargado es obligatorio';
    } else if (!validarEmail(formulario.correoEncargado)) {
      nuevosErrores.correoEncargado = 'Formato de correo inválido';
    }

    // Verificar cédula existente solo si no estamos editando o si cambió
    if (!datosIniciales || formulario.cedula !== datosIniciales.cedula) {
      setValidando(true);
      const existe = await verificarCedulaExistente(
        formulario.cedula, 
        datosIniciales?.id_estudiante
      );
      setValidando(false);
      if (existe) {
        nuevosErrores.cedula = 'Esta cédula ya está registrada';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      alert('Por favor corrija los errores en el formulario');
      return;
    }

    // Aquí le pasamos todo el objeto al padre (Estudiantes.jsx)
    if (onGuardar) {
      await onGuardar(formulario);
    }
  };

  return (
    <form className="form-estudiante" onSubmit={manejarSubmit}>
      {/* ================= DATOS DEL ESTUDIANTE ================= */}
      <h2 className="seccion-titulo">
        {datosIniciales ? "Editar Estudiante" : "Datos del Estudiante"}
      </h2>

      <div className="fila">
        <div className="campo">
          <label>Cédula *</label>
          <input
            name="cedula"
            value={formulario.cedula}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('cedula', e.target.value)}
            required
            disabled={!!datosIniciales} // No permitir cambiar cédula en edición
            placeholder="#-####-####"
            className={errores.cedula ? 'input-error' : ''}
          />
          {errores.cedula && <span className="mensaje-error">{errores.cedula}</span>}
          {validando && <span className="mensaje-info">Verificando cédula...</span>}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Nombre Completo *</label>
          <input
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
          />
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Correo Institucional *</label>
          <input
            type="email"
            name="correoInstitucional"
            value={formulario.correoInstitucional}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('correoInstitucional', e.target.value)}
            required
            placeholder="ejemplo@universidad.edu"
            className={errores.correoInstitucional ? 'input-error' : ''}
          />
          {errores.correoInstitucional && <span className="mensaje-error">{errores.correoInstitucional}</span>}
        </div>
        <div className="campo">
          <label>Correo Personal</label>
          <input
            type="email"
            name="correoPersonal"
            value={formulario.correoPersonal}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('correoPersonal', e.target.value)}
            placeholder="ejemplo@correo.com"
            className={errores.correoPersonal ? 'input-error' : ''}
          />
          {errores.correoPersonal && <span className="mensaje-error">{errores.correoPersonal}</span>}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Teléfono</label>
          <input
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('telefono', e.target.value)}
            placeholder="####-####"
            className={errores.telefono ? 'input-error' : ''}
          />
          {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
        </div>
        <div className="campo">
          <label>Colegio de procedencia</label>
          <input
            name="colegioProcedencia"
            value={formulario.colegioProcedencia}
            onChange={manejarCambio}
          />
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Nivel Académico *</label>
          <select
            name="grado"
            value={formulario.grado}
            onChange={manejarCambio}
            required
          >
            <option value="Cuarto Nivel">Cuarto Nivel</option>
            <option value="Quinto Nivel">Quinto Nivel</option>
          </select>
        </div>
      </div>

      <div className="fila">
        <div className="campo full">
          <label>Dirección</label>
          <textarea
            name="direccion"
            value={formulario.direccion}
            onChange={manejarCambio}
            rows={2}
          />
        </div>
      </div>

      {/* ================= DATOS DEL ENCARGADO ================= */}
      <h2 className="seccion-titulo">
        {datosIniciales ? "Datos del Encargado (Solo lectura)" : "Datos del Encargado (Obligatorio)"}
      </h2>

      {datosIniciales && (
        <div className="info-edicion" style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#fff3cd", borderLeft: "4px solid #ffc107", borderRadius: "4px" }}>
          <p style={{ color: "#856404", fontSize: "0.9rem", margin: 0 }}>
            ℹ️ <strong>Nota:</strong> Los datos del encargado no pueden editarse desde aquí. 
            Para modificarlos, vaya a la sección "Gestión de Encargados".
          </p>
        </div>
      )}

      <div className="fila">
        <div className="campo">
          <label>Nombre del Encargado *</label>
          <input
            name="nombreEncargado"
            value={formulario.nombreEncargado}
            onChange={manejarCambio}
            required
            disabled={!!datosIniciales}
          />
        </div>
        <div className="campo">
          <label>Correo del Encargado *</label>
          <input
            type="email"
            name="correoEncargado"
            value={formulario.correoEncargado}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('correoEncargado', e.target.value)}
            required
            disabled={!!datosIniciales}
            placeholder="encargado@correo.com"
            className={errores.correoEncargado ? 'input-error' : ''}
          />
          {errores.correoEncargado && <span className="mensaje-error">{errores.correoEncargado}</span>}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Teléfono del Encargado</label>
          <input
            name="telefonoEncargado"
            value={formulario.telefonoEncargado}
            onChange={manejarCambio}
            onBlur={(e) => validarCampo('telefonoEncargado', e.target.value)}
            disabled={!!datosIniciales}
            placeholder="####-####"
            className={errores.telefonoEncargado ? 'input-error' : ''}
          />
          {errores.telefonoEncargado && <span className="mensaje-error">{errores.telefonoEncargado}</span>}
        </div>
      </div>

      {/* Botones */}
      <div className="acciones-form">
        <button
          type="button"
          className="btn-cancelar"
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-guardar"
          disabled={validando || Object.keys(errores).length > 0}
        >
          {validando ? 'Validando...' : (datosIniciales ? "Actualizar" : "Guardar")}
        </button>
      </div>
    </form>
  );
}

export default FormularioEstudiante;
