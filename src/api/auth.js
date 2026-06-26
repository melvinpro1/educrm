const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Error al registrar usuario");
    }

    return { ok: true, data, pendiente_aprobacion: data?.pendiente_aprobacion === true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 403 && data?.pendiente_aprobacion) {
      return { ok: false, pendiente_aprobacion: true, error: data.detail };
    }

    if (!response.ok) {
      throw new Error(data?.detail || "Error al iniciar sesión");
    }

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("vistasPermitidas", JSON.stringify(data.user.vistas_permitidas || []));
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("vistasPermitidas");
}

export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function getUserRole() {
  const user = getCurrentUser();
  return user?.rol || null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.is_superuser === true || user?.rol === "admin";
}

export function getVistasPermitidas() {
  const stored = localStorage.getItem("vistasPermitidas");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  const user = getCurrentUser();
  return user?.vistas_permitidas || [];
}

export function tienePermiso(vista) {
  if (isAdmin()) return true;
  return getVistasPermitidas().includes(vista);
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
