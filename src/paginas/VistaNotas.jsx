import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import { obtenerCursos, obtenerEstudiantesCurso } from "../api/cursos";
import { getUserRole, getAuthToken } from "../api/auth";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

function colorNota(nota) {
  const n = parseFloat(nota);
  if (isNaN(n)) return { bg: "#f1f5f9", text: "#64748b" };
  if (n >= 9)   return { bg: "#d1fae5", text: "#065f46" };
  if (n >= 7)   return { bg: "#dbeafe", text: "#1e40af" };
  if (n >= 5)   return { bg: "#fef9c3", text: "#92400e" };
  return         { bg: "#fee2e2", text: "#991b1b" };
}

function BadgeNota({ nota }) {
  const c = colorNota(nota);
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        fontWeight: 700,
        fontSize: "15px",
        padding: "2px 10px",
        borderRadius: "8px",
        minWidth: "44px",
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {nota != null ? Number(nota).toFixed(1) : "—"}
    </span>
  );
}

function VistaNotas() {
  const [cursos, setCursos] = useState([]);
  const [datos, setDatos] = useState({});   // { cursoId: [inscripcion...] }
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [cursoAbierto, setCursoAbierto] = useState(null);
  const esEncargado = getUserRole() === "encargado";

  useEffect(() => {
    async function cargar() {
      if (esEncargado) {
        // Obtener solo los cursos con notas de los estudiantes vinculados al encargado
        const res = await fetch(`${API_BASE}/auth/notas-encargado/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${getAuthToken() || ""}`,
          },
        });
        if (!res.ok) { setCargando(false); return; }
        const cursosConEst = await res.json();
        // Normalizar para que tenga la misma forma que el modo general
        setCursos(cursosConEst.map((c) => ({
          id_curso: c.id_curso,
          nombre: c.nombre,
          nivel_grado: c.nivel_grado,
          horario: c.horario,
          profesor_nombre: c.profesor_nombre,
        })));
        const mapa = {};
        cursosConEst.forEach((c) => { mapa[c.id_curso] = c.estudiantes; });
        setDatos(mapa);
      } else {
        const listaCursos = await obtenerCursos("activos");
        setCursos(listaCursos);
        const resultados = await Promise.all(
          listaCursos.map((c) =>
            obtenerEstudiantesCurso(c.id_curso).then((est) => [c.id_curso, est])
          )
        );
        setDatos(Object.fromEntries(resultados));
      }
      setCargando(false);
    }
    cargar();
  }, [esEncargado]);

  const cursosFiltrados = cursos.filter((c) => {
    const t = busqueda.toLowerCase();
    return !t || c.nombre.toLowerCase().includes(t) || c.nivel_grado.toLowerCase().includes(t);
  });

  if (cargando) {
    return <div className="estudiantes"><p>Cargando notas...</p></div>;
  }

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Notas por Curso</h1>
          <p>
            {esEncargado
              ? "Calificaciones de sus estudiantes asociados."
              : "Consulte las calificaciones de los estudiantes inscritos en cada curso."}
          </p>
        </div>
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre de curso o grado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cursosFiltrados.length === 0 ? (
        <p style={{ color: "#6b7280", marginTop: "16px" }}>No se encontraron cursos.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cursosFiltrados.map((curso) => {
            const inscritos = datos[curso.id_curso] || [];
            const abierto = cursoAbierto === curso.id_curso;

            return (
              <div
                key={curso.id_curso}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {/* Cabecera del curso */}
                <div
                  onClick={() => setCursoAbierto(abierto ? null : curso.id_curso)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    cursor: "pointer",
                    background: abierto ? "#eff6ff" : "#fff",
                    borderBottom: abierto ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="bi bi-journal-bookmark-fill" style={{ color: "#1d4ed8", fontSize: "20px" }}></span>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "15px" }}>{curso.nombre}</p>
                      <p style={{ color: "#6b7280", margin: 0, fontSize: "13px" }}>
                        {curso.nivel_grado} · {curso.horario} · {curso.profesor_nombre}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                      {inscritos.length} estudiante(s)
                    </span>
                    <span style={{ color: "#6b7280", fontSize: "18px" }}>{abierto ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Lista de estudiantes con notas */}
                {abierto && (
                  <div style={{ padding: "12px 20px" }}>
                    {inscritos.length === 0 ? (
                      <p style={{ color: "#6b7280", fontSize: "14px", padding: "8px 0" }}>
                        Sin estudiantes inscritos en este curso.
                      </p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th style={thStyle}>Estudiante</th>
                            <th style={thStyle}>Cédula</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Nota</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscritos.map((i, idx) => {
                            const n = parseFloat(i.nota);
                            const estado = isNaN(n) ? "Sin nota" : n >= 7 ? "Aprobado" : n >= 5 ? "En proceso" : "Reprobado";
                            return (
                              <tr key={i.id_estudiante_pk} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                <td style={tdStyle}>{i.nombre}</td>
                                <td style={tdStyle}>{i.cedula}</td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                  <BadgeNota nota={i.nota} />
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center", fontSize: "12px", fontWeight: 600, color: colorNota(i.nota).text }}>
                                  {estado}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "8px 12px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "13px",
  color: "#374151",
  border: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "9px 12px",
  fontSize: "14px",
  color: "#374151",
  border: "1px solid #e2e8f0",
};

export default VistaNotas;
