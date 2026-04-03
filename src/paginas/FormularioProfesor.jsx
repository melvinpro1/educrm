import React, { useState, useEffect } from "react";

function FormularioProfesor({ onGuardar, onCancelar, datosIniciales = null }) {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    correo: "",
    telefono: "",
    activo: true,
  });

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

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
      <h2>{datosIniciales ? "Editar Profesor" : "Nuevo Profesor"}</h2>

      <form onSubmit={manejarSubmit} style={{ display: "grid", gap: "12px" }}>
        <input
          name="cedula"
          placeholder="Cédula"
          value={formData.cedula}
          onChange={manejarCambio}
          required
        />

        <input
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={manejarCambio}
          required
        />

        <input
          name="correo"
          placeholder="Correo"
          value={formData.correo}
          onChange={manejarCambio}
          required
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={manejarCambio}
        />

        {datosIniciales && (
          <label>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={manejarCambio}
            />
            Activo
          </label>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onCancelar}>
            Cancelar
          </button>

          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProfesor;