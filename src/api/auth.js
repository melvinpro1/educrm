import { apiPost } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario { username, email, password, first_name, last_name }
 * @returns {Promise<Object>} Token y datos del usuario
 */
export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al registrar usuario");
    }

    const data = await response.json();
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return { ok: true, data };
  } catch (error) {
    console.error("Error en registro:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Inicia sesión con credenciales de usuario
 * @param {string} username - Nombre de usuario o correo
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Token y datos del usuario
 */
export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al iniciar sesión");
    }

    const data = await response.json();
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return { ok: true, data };
  } catch (error) {
    console.error("Error en login:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

/**
 * Obtiene los datos del usuario actual
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export async function recuperarPassword(email, password_nueva) {
  try {
    const response = await fetch(`${API_BASE}/auth/recuperar/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password_nueva }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || "Error al recuperar contraseña.");
    }
    return { ok: true, detail: data?.detail };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
