// src/api/estudiantes.js
import { apiGet, apiDelete, apiPatch } from "./client";

export async function getEstudiantes() {
  return apiGet("/estudiantes/");
}

export async function deleteEstudiante(id) {
  try {
    await apiDelete(`/estudiantes/${id}/`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al eliminar estudiante.",
    };
  }
}

export async function createEstudiante(formData) {
  // ⚠ formData viene tal cual del FormularioEstudiante
  const payload = {
    cedula: formData.cedula,
    nombre: formData.nombre,
    correo_institucional: formData.correoInstitucional,
    correo_personal: formData.correoPersonal || null,
    grado: formData.grado,                 // "Cuarto Nivel" / "Quinto Nivel"
    direccion_domicilio: formData.direccion || "",
    estado: true,
    encargado: {
      nombre: formData.nombreEncargado,
      correo: formData.correoEncargado,
      telefono: formData.telefonoEncargado,
      estado: true,
    },
  };

  try {
    const res = await fetch("http://localhost:8000/api/estudiantes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail =
        data?.detail || "Error al crear estudiante. Revisa los datos enviados.";
      const err = new Error(detail);
      err.detail = detail;
      throw err;
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al crear estudiante.",
    };
  }
}

export async function updateEstudiante(id, payloadParcial) {
  try {
    const res = await apiPatch(`/estudiantes/${id}/`, payloadParcial);
    return { ok: true, data: res };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al actualizar estudiante.",
    };
  }
}
