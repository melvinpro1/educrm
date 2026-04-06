import { apiGet, apiDelete, apiPatch } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function getEncargados(estado = "activos") {
  return apiGet(`/encargados/?estado=${estado}`);
}

export async function createEncargado(data) {
  try {
    const res = await fetch(`${API_BASE}/encargados/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json().catch(() => null);

    if (!res.ok) {
      const detail =
        responseData?.detail || responseData?.correo?.[0] || "Error al crear encargado. Revisa los datos enviados.";
      const err = new Error(detail);
      err.detail = detail;
      throw err;
    }

    return { ok: true, data: responseData };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al crear encargado.",
    };
  }
}

export async function deleteEncargado(id) {
  try {
    await apiDelete(`/encargados/${id}/`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al eliminar encargado.",
    };
  }
}

export async function updateEncargado(id, data) {
  try {
    const res = await apiPatch(`/encargados/${id}/`, data);
    return { ok: true, data: res };
  } catch (err) {
    return {
      ok: false,
      error: err.detail || err.message || "Error al actualizar encargado.",
    };
  }
}
