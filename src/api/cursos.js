import { apiGet, apiDelete } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function obtenerCursos(estado = "activos") {
  try {
    let url = `/cursos/?estado=${estado}`;
    return await apiGet(url);
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
    nota: formData.nota || null,
  };

  try {
    const res = await fetch(`${API_BASE}/cursos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = "Error al crear curso.";

      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.non_field_errors) {
          errorMsg = data.non_field_errors.join(", ");
        } else {
          const errors = Object.entries(data)
            .map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
              if (typeof value === "object") return `${key}: ${JSON.stringify(value)}`;
              return `${key}: ${value}`;
            })
            .join("\n");
          errorMsg = errors || errorMsg;
        }
      }

      const err = new Error(errorMsg);
      err.detail = errorMsg;
      throw err;
    }

    return { ok: true, data };
  } catch (err) {
    const msg = err.detail || err.message || "";
    return {
      ok: false,
      error: msg === "Failed to fetch" ? "No se pudo conectar al servidor." : msg || "Error al crear curso.",
    };
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
      let errorMsg = "Error al actualizar curso.";

      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.non_field_errors) {
          errorMsg = data.non_field_errors.join(", ");
        } else {
          const errors = Object.entries(data)
            .map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
              if (typeof value === "object") return `${key}: ${JSON.stringify(value)}`;
              return `${key}: ${value}`;
            })
            .join("\n");
          errorMsg = errors || errorMsg;
        }
      }

      const err = new Error(errorMsg);
      err.detail = errorMsg;
      throw err;
    }

    return { ok: true, data };
  } catch (err) {
    const msg = err.detail || err.message || "";
    return {
      ok: false,
      error: msg === "Failed to fetch" ? "No se pudo conectar al servidor." : msg || "Error al actualizar curso.",
    };
  }
}

