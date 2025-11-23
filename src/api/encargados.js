import { apiGet, apiDelete } from "./client";

export async function getEncargados(search) {
  if (search && search.trim() !== "") {
    return apiGet("/encargados/", { params: { search } });
  }
  return apiGet("/encargados/");
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
