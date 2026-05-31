const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function obtenerActivos({ busqueda = "", estado = "", tipo = "" } = {}) {
  const params = new URLSearchParams();
  if (busqueda) params.append("busqueda", busqueda);
  if (estado) params.append("estado", estado);
  if (tipo) params.append("tipo", tipo);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/activos/${query}`);
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

export async function obtenerActivo(id) {
  const res = await fetch(`${API_BASE}/activos/${id}/`);
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

export async function crearActivo(formData) {
  const payload = {
    tipo: formData.tipo,
    nombre: formData.nombre.trim(),
    estado: formData.estado || "disponible",
  };
  const res = await fetch(`${API_BASE}/activos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error =
      data?.detail ||
      data?.nombre?.[0] ||
      data?.non_field_errors?.[0] ||
      "Error al crear el activo";
    return { ok: false, error };
  }
  return { ok: true, data };
}

export async function actualizarActivo(id, payload) {
  const res = await fetch(`${API_BASE}/activos/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error =
      data?.detail ||
      data?.nombre?.[0] ||
      data?.non_field_errors?.[0] ||
      "Error al actualizar el activo";
    return { ok: false, error };
  }
  return { ok: true, data };
}

export async function eliminarActivo(id) {
  const res = await fetch(`${API_BASE}/activos/${id}/`, { method: "DELETE" });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    return { ok: false, error: data?.detail || "Error al eliminar el activo" };
  }
  return { ok: true, mensaje: data?.mensaje };
}

export async function uploadActivosCSV(datos) {
  const res = await fetch(`${API_BASE}/activos/upload-bulk/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || "Error al importar activos",
    };
  }
  return { ok: true, data };
}

