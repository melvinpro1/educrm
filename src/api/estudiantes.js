import { apiGet, apiDelete } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function getEstudiantes(estado = "activos") {
  return apiGet(`/estudiantes/?estado=${estado}`);
}

export async function verificarCedulaExistente(cedula, excludeId = null) {
  try {
    const estudiantes = await apiGet("/estudiantes/");
    const cedulaSinFormato = cedula.replace(/\D/g, "");

    return estudiantes.some((est) => {
      const cedulaEstudiante = est.cedula
        ? est.cedula.replace(/\D/g, "")
        : "";
      return (
        cedulaEstudiante === cedulaSinFormato &&
        est.id_estudiante !== excludeId
      );
    });
  } catch (error) {
    console.error("Error verificando cédula:", error);
    return false;
  }
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
  const payload = {
    cedula: formData.cedula,
    nombre: formData.nombre,
    correo_institucional: formData.correoInstitucional,
    correo_personal: formData.correoPersonal || null,
    telefono: formData.telefono || "",
    colegio_procedencia: formData.colegioProcedencia || "",
    grado: formData.grado,
    direccion_domicilio: formData.direccion || "",
    encargado: {
      nombre: formData.nombreEncargado,
      correo: formData.correoEncargado,
      telefono: formData.telefonoEncargado,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/estudiantes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = "Error al crear estudiante.";

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
      error: err.detail || err.message || "Error al crear estudiante.",
    };
  }
}

export async function updateEstudiante(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/estudiantes/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = data?.detail || "Error al actualizar estudiante.";
      const err = new Error(detail);
      err.detail = detail;
      throw err;
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al actualizar estudiante.",
    };
  }
}

export async function reactivarEstudiante(id) {
  try {
    const res = await fetch(`${API_BASE}/estudiantes/${id}/?estado=todos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: true }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = data?.detail || "Error al reactivar estudiante.";
      const err = new Error(detail);
      err.detail = detail;
      throw err;
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al reactivar estudiante.",
    };
  }
}

export async function getHistorialAcciones() {
  try {
    return await apiGet("/estudiantes/historial/");
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return [];
  }
}

export async function uploadEstudiantesCSV(estudiantes) {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${API_BASE}/estudiantes/upload-bulk/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estudiantes),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok && res.status !== 207) {
      return { ok: false, error: data?.error || "Error en la carga masiva." };
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.message || "Error al conectar con el servidor para la carga masiva.",
    };
  }
}