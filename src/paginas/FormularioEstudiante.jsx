// 📁 src/paginas/FormularioEstudiante.jsx
// Formulario para registrar/editar Estudiante + Encargado al mismo tiempo.

import React, { useState, useEffect } from "react";
import "../recursos/estilos/VistaEstudiante.css";

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

  // Manejar cambios en cualquier input
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    // Validación rápida mínima: encargado obligatorio
    if (
      !formulario.nombreEncargado ||
      !formulario.correoEncargado ||
      !formulario.telefonoEncargado
    ) {
      alert(
        "Los datos del encargado son obligatorios para registrar al estudiante."
      );
      return;
    }

    // Aquí le pasamos todo el objeto al padre (Estudiantes.jsx)
    // Luego, en backend, esto será un solo payload:
    // { estudiante: {...}, encargado: {...} }
    if (onGuardar) {
      onGuardar(formulario);
    }

    // Opcional: limpiar formulario después
    setFormulario({
      cedula: "",
      nombre: "",
      correoInstitucional: "",
      correoPersonal: "",
      telefono: "",
      colegioProcedencia: "",
      grado: "Cuarto Nivel",
      direccion: "",
      nombreEncargado: "",
      correoEncargado: "",
      telefonoEncargado: "",
    });
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
            required
            disabled={!!datosIniciales} // No permitir cambiar cédula en edición
          />
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
            required
          />
        </div>
        <div className="campo">
          <label>Correo Personal</label>
          <input
            type="email"
            name="correoPersonal"
            value={formulario.correoPersonal}
            onChange={manejarCambio}
          />
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Teléfono *</label>
          <input
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            required
          />
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
            required
            disabled={!!datosIniciales}
          />
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Teléfono del Encargado *</label>
          <input
            name="telefonoEncargado"
            value={formulario.telefonoEncargado}
            onChange={manejarCambio}
            required
            disabled={!!datosIniciales}
          />
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
        <button type="submit" className="btn-guardar">
          {datosIniciales ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default FormularioEstudiante;
