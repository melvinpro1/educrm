import { getAuthToken } from "./auth";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export async function obtenerUsuarios() {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
}

export async function crearUsuario(data) {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al crear usuario.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message || "Error al crear usuario." };
  }
}

export async function actualizarUsuario(id, data) {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/${id}/`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al actualizar usuario.");
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message || "Error al actualizar usuario." };
  }
}

export async function desactivarUsuario(id) {
  try {
    const res = await fetch(`${API_BASE}/auth/usuarios/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.detail || "Error al desactivar usuario.");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "Error al desactivar usuario." };
  }
}
