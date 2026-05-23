import React, { useState, useEffect } from "react";
import "../recursos/estilos/FormularioProfesor.css";

const TIPOS = [
  { value: "computadora", label: "Computadora" },
  { value: "tablet", label: "Tablet" },
  { value: "libro", label: "Libro" },
  { value: "proyector", label: "Proyector" },
  { value: "otro", label: "Otro" },
];

function FormularioActivo({ onGuardar, onCancelar, datosIniciales = null }) {
  const [formData, setFormData] = useState({
    tipo: "computadora",
    nombre: "",
    estado: "disponible",
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (datosIniciales) {
      setFormData({
        tipo: datosIniciales.tipo || "computadora",
        nombre: datosIniciales.nombre || "",
        estado: datosIniciales.estado || "disponible",
      });
    }
  }, [datosIniciales]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre || formData.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre del activo es obligatorio";
    }
    if (!formData.tipo) {
      nuevosErrores.tipo = "Debe seleccionar un tipo";
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
        {datosIniciales ? "Editar Activo" : "Nuevo Activo"}
      </p>

      <form onSubmit={manejarSubmit}>
        <div className="campo">
          <label>Tipo *</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={manejarCambio}
            className={errores.tipo ? "input-error" : ""}
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errores.tipo && <span className="mensaje-error">{errores.tipo}</span>}
        </div>

        <div className="campo">
          <label>Nombre / Descripción *</label>
          <input
            name="nombre"
            placeholder="Ej: Laptop Dell Inspiron 15"
            value={formData.nombre}
            onChange={manejarCambio}
            className={errores.nombre ? "input-error" : ""}
          />
          {errores.nombre && (
            <span className="mensaje-error">{errores.nombre}</span>
          )}
        </div>

        {datosIniciales && (
          <div className="campo">
            <label>Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={manejarCambio}
            >
              <option value="disponible">Disponible</option>
              <option value="en_mantenimiento">En mantenimiento</option>
            </select>
            <span className="mensaje-info" style={{ fontSize: "12px", color: "#6b7280" }}>
              El estado "Prestado" se asigna automáticamente al registrar un préstamo.
            </span>
          </div>
        )}

        <div className="acciones-form">
          <button type="button" className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            {datosIniciales ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioActivo;
