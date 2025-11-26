// src/api/client.js
// Usa la variable de entorno o el valor por defecto
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function apiGet(path, { params } = {}) {
  let url = API_BASE + path;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += "?" + qs;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error GET ${url}: ${res.status}`);
  }

  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
  });

  if (res.status === 204) {
    return;
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no body o no JSON
  }
  

  if (!res.ok) {
    const detail = data?.detail || `Error DELETE ${path}: ${res.status}`;
    const err = new Error(detail);
    err.detail = detail;
    throw err;
  }

  return data;
}

export async function apiPatch(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // puede venir sin body
  }

  if (!res.ok) {
    const detail = data?.detail || `Error PATCH ${path}: ${res.status}`;
    const err = new Error(detail);
    err.detail = detail;
    throw err;
  }

  return data;
}
