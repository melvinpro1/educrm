// src/api/comunicaciones.js

const BASE_URL = "http://localhost:8000"; // cámbialo si usás otra URL

// GET /api/comunicaciones/correos/
export async function getComunicaciones(token) {
  const res = await fetch(`${BASE_URL}/api/comunicaciones/correos/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Error al cargar comunicaciones");
  }

  return await res.json();
}

// POST /api/comunicaciones/correos/enviar/
export async function enviarCorreo(payload, token) {
  const res = await fetch(
    `${BASE_URL}/api/comunicaciones/correos/enviar/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error del backend:", errorData);
    throw new Error("Error al enviar el correo");
  }

  return await res.json(); // aquí viene el CorreoSerializer
}
