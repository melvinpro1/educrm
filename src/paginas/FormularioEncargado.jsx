// 📁 src/paginas/FormularioEncargado.jsx
// Formulario para registrar/editar Encargado.

import React, { useState, useEffect } from "react";
import "../recursos/estilos/VistaEstudiante.css";

function FormularioEncargado({ onGuardar, onCancelar, datosIniciales = null }) {
  // 🔹 Estado para los campos del encargado
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  });

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

  // Manejar cambios en cualquier input
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!formulario.nombre || !formulario.correo || !formulario.telefono) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formulario.correo)) {
      alert("Por favor ingrese un correo válido.");
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
            required
            placeholder="Ej: María González Ramírez"
          />
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
            required
            disabled={!!datosIniciales} // No permitir cambiar correo en edición (es único)
            placeholder="Ej: maria.gonzalez@ccsp.ed.cr"
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
            placeholder="Ej: 8888-7777"
          />
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
        <button type="submit" className="btn-guardar">
          {datosIniciales ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default FormularioEncargado;
