import { apiGet, apiDelete } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function obtenerCursos(estado = "activos") {
  try {
    return await apiGet(`/cursos/?estado=${estado}`);
  } catch (error) {
    console.error("Error obteniendo cursos:", error);
    return [];
  }
}

export async function eliminarCurso(id) {
  try {
    await apiDelete(`/cursos/${id}/`);
    return { ok: true };
  } catch (err) {
    const msg = err.detail || err.message || "";
    return {
      ok: false,
      error: msg === "Failed to fetch" ? "No se pudo conectar al servidor." : msg || "Error al eliminar curso.",
    };
  }
}

export async function crearCurso(formData) {
  const payload = {
    nombre: formData.nombre,
    nivel_grado: formData.nivel_grado,
    horario: formData.horario,
    estado: formData.estado || "activo",
    id_profesor: formData.id_profesor,
  };

  try {
    const res = await fetch(`${API_BASE}/cursos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = _extraerError(data, "Error al crear curso.");
      throw Object.assign(new Error(errorMsg), { detail: errorMsg });
    }
    return { ok: true, data };
  } catch (err) {
    const msg = err.detail || err.message || "";
    return { ok: false, error: msg === "Failed to fetch" ? "No se pudo conectar al servidor." : msg || "Error al crear curso." };
  }
}

export async function actualizarCurso(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/cursos/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = _extraerError(data, "Error al actualizar curso.");
      throw Object.assign(new Error(errorMsg), { detail: errorMsg });
    }
    return { ok: true, data };
  } catch (err) {
    const msg = err.detail || err.message || "";
    return { ok: false, error: msg === "Failed to fetch" ? "No se pudo conectar al servidor." : msg || "Error al actualizar curso." };
  }
}

// ── Inscripción de estudiantes ──────────────────────────────────────────────

export async function obtenerEstudiantesCurso(cursoId) {
  try {
    return await apiGet(`/cursos/${cursoId}/estudiantes/`);
  } catch (err) {
    console.error("Error obteniendo estudiantes del curso:", err);
    return [];
  }
}

export async function agregarEstudiantesCurso(cursoId, estudiantesIds) {
  try {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/estudiantes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estudiantes_ids: estudiantesIds }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Error al agregar estudiantes.");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function quitarEstudianteCurso(cursoId, estudianteId) {
  try {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/estudiantes/${estudianteId}/`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Error al quitar estudiante.");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function actualizarNotaEstudiante(cursoId, estudianteId, nota) {
  try {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/estudiantes/${estudianteId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota: nota === "" ? null : nota }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Error al actualizar nota.");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function _extraerError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors) return data.non_field_errors.join(", ");
  const entries = Object.entries(data).map(([k, v]) =>
    Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`
  );
  return entries.join("\n") || fallback;
}
