const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function obtenerPrestamos({ activo = "", estudiante = "", estado = "" } = {}) {
  const params = new URLSearchParams();
  if (activo) params.append("activo", activo);
  if (estudiante) params.append("estudiante", estudiante);
  if (estado) params.append("estado", estado);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/prestamos/${query}`);
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

export async function crearPrestamo(formData) {
  const payload = {
    id_activo: formData.id_activo,
    id_estudiante: formData.id_estudiante,
    fecha_prestamo: formData.fecha_prestamo,
    fecha_retorno_esperada: formData.fecha_retorno_esperada,
  };
  const res = await fetch(`${API_BASE}/prestamos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      data?.fecha_retorno_esperada?.[0] ||
      "Error al registrar el préstamo";
    return { ok: false, error };
  }
  return { ok: true, data };
}

export async function registrarDevolucion(id, fechaRetornoReal = null) {
  const body = {};
  if (fechaRetornoReal) body.fecha_retorno_real = fechaRetornoReal;
  const res = await fetch(`${API_BASE}/prestamos/${id}/devolver/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: data?.detail || "Error al registrar la devolución" };
  }
  return { ok: true, data };
}
