import { apiGet } from "./client";

/**
 * Obtiene las estadísticas para el dashboard
 * @returns {Promise<Object>} Objeto con las estadísticas
 */
export async function getDashboardStats() {
  try {
    const data = await apiGet("/estudiantes/dashboard-stats/");
    return data;
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error);
    return {
      estudiantes_activos: 0,
      estudiantes_totales: 0,
      encargados_totales: 0,
      comunicaciones_enviadas: 0,
      correos_totales: 0,
      estudiantes_por_nivel: [],
    };
  }
}
