import { apiGet, apiDelete } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function obtenerProfesores(estado = "activos") {
  try {
    return await apiGet(`/profesores/?estado=${estado}`);
  } catch (error) {
    console.error("Error obteniendo profesores:", error);
    return [];
  }
}

export async function eliminarProfesor(id) {
  try {
    await apiDelete(`/profesores/${id}/`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al eliminar profesor.",
    };
  }
}

export async function crearProfesor(formData) {
  const payload = {
    cedula: formData.cedula,
    nombre: formData.nombre,
    correo: formData.correo,
    telefono: formData.telefono || "",
    activo: formData.activo ?? true,
  };

  try {
    const res = await fetch(`${API_BASE}/profesores/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = "Error al crear profesor.";

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
    return {
      ok: false,
      error: err.detail || err.message || "Error al crear profesor.",
    };
  }
}

export async function actualizarProfesor(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/profesores/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = data?.detail || "Error al actualizar profesor.";
      const err = new Error(detail);
      err.detail = detail;
      throw err;
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al actualizar profesor.",
    };
  }
}