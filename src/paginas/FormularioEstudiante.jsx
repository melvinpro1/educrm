// 📁 src/paginas/FormularioEstudiante.jsx
// Formulario para registrar Estudiante + Encargado al mismo tiempo.

import React, { useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";

function FormularioEstudiante({ onGuardar, onCancelar }) {
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
      <h2 className="seccion-titulo">Datos del Estudiante</h2>

      <div className="fila">
        <div className="campo">
          <label>Cédula *</label>
          <input
            name="cedula"
            value={formulario.cedula}
            onChange={manejarCambio}
            required
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
      <h2 className="seccion-titulo">Datos del Encargado (Obligatorio)</h2>

      <div className="fila">
        <div className="campo">
          <label>Nombre del Encargado *</label>
          <input
            name="nombreEncargado"
            value={formulario.nombreEncargado}
            onChange={manejarCambio}
            required
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
          Guardar
        </button>
      </div>
    </form>
  );
}

export default FormularioEstudiante;
