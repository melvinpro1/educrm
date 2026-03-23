// src/api/comunicaciones.js

const BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || "http://localhost:8000";

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

// POST /api/comunicaciones/correos/enviar/ - CON ARCHIVOS ADJUNTOS
export async function enviarCorreo(payload, archivos, token) {
  // Usar FormData para enviar archivos
  const formData = new FormData();
  
  // Agregar datos de texto
  formData.append('asunto', payload.asunto);
  formData.append('contenido', payload.contenido);
  formData.append('tipo_correo', payload.tipo_correo);
  formData.append('tipo_email_estudiante', payload.tipo_email_estudiante);
  formData.append('segmento', payload.segmento);
  
  // Agregar IDs de estudiantes
  payload.estudiantes_ids.forEach((id) => {
    formData.append('estudiantes_ids', id);
  });
  
  // Agregar archivos
  archivos.forEach((archivo) => {
    formData.append('adjuntos', archivo);
  });

  const res = await fetch(
    `${BASE_URL}/api/comunicaciones/correos/enviar/`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // NO agregar Content-Type, dejar que el navegador lo calcule
      },
      body: formData, // Enviar FormData
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error del backend:", errorData);
    throw new Error("Error al enviar el correo");
  }

  return await res.json(); // aquí viene el CorreoSerializer
}
