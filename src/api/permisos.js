import { getAuthToken } from "./auth";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export async function obtenerPermisosRol() {
  try {
    const res = await fetch(`${API_BASE}/auth/permisos-rol/`, {
      headers: authHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al obtener permisos.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function actualizarPermisosRol(rol, vistas) {
  try {
    const res = await fetch(`${API_BASE}/auth/permisos-rol/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rol, vistas }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al actualizar permisos.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function obtenerUsuariosPendientes() {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/pendientes/`, {
      headers: authHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al obtener pendientes.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function aprobarUsuario(id, rol, encargado_id = null) {
  try {
    const body = { accion: "aprobar", rol };
    if (encargado_id) body.encargado_id = encargado_id;
    const res = await fetch(`${API_BASE}/auth/usuarios/${id}/aprobar/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al aprobar usuario.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function rechazarUsuario(id) {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/${id}/aprobar/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ accion: "rechazar" }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al rechazar usuario.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
