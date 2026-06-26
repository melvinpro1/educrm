import React, { useState, useEffect, useCallback } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import {
  obtenerPermisosRol,
  actualizarPermisosRol,
  obtenerUsuariosPendientes,
  aprobarUsuario,
  rechazarUsuario,
} from "../api/permisos";

const ROLES = [
  { code: "director", nombre: "Director" },
  { code: "administrador", nombre: "Administrador" },
  { code: "profesor", nombre: "Profesor" },
  { code: "encargado", nombre: "Encargado" },
];

const VISTAS_LABELS = {
  home: "Panel Principal",
  estudiantes: "Estudiantes",
  encargados: "Encargados",
  profesores: "Profesores",
  cursos: "Cursos",
  comunicaciones: "Comunicaciones",
  activos: "Activos",
  prestamos: "Préstamos",
  usuarios: "Usuarios",
  permisos: "Permisos",
  notas: "Notas (Encargado)",
};

const TODAS_LAS_VISTAS = Object.keys(VISTAS_LABELS);

const BADGE_COLORES = {
  admin: { bg: "#1e3a8a", text: "#fff" },
  director: { bg: "#065f46", text: "#fff" },
  administrador: { bg: "#92400e", text: "#fff" },
  profesor: { bg: "#4c1d95", text: "#fff" },
  encargado: { bg: "#164e63", text: "#fff" },
};

function BadgeRol({ rol }) {
  const style = BADGE_COLORES[rol] || { bg: "#6b7280", text: "#fff" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.text,
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {rol}
    </span>
  );
}

/* ─── Pestaña de Permisos por Rol ─── */
function TabPermisos() {
  const [permisos, setPermisos] = useState(null);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await obtenerPermisosRol();
    if (res.ok) setPermisos(res.data);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const togglePermiso = (rolCode, vista) => {
    setPermisos((prev) => ({
      ...prev,
      [rolCode]: {
        ...prev[rolCode],
        vistas: {
          ...prev[rolCode].vistas,
          [vista]: !prev[rolCode].vistas[vista],
        },
      },
    }));
  };

  const guardarRol = async (rolCode) => {
    setGuardando(rolCode);
    setMensaje(null);
    const vistas = permisos[rolCode].vistas;
    const res = await actualizarPermisosRol(rolCode, vistas);
    setGuardando(null);
    if (res.ok) {
      setMensaje({ tipo: "ok", texto: `Permisos de "${permisos[rolCode].nombre}" guardados.` });
    } else {
      setMensaje({ tipo: "error", texto: res.error });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  if (cargando) return <p style={{ padding: "24px" }}>Cargando permisos...</p>;
  if (!permisos) return <p style={{ padding: "24px", color: "red" }}>Error al cargar permisos.</p>;

  return (
    <div>
      {mensaje && (
        <div
          style={{
            margin: "0 0 16px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
            color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
            fontWeight: 500,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={thStyle}>Vista / Módulo</th>
              {ROLES.map((r) => (
                <th key={r.code} style={{ ...thStyle, textAlign: "center" }}>
                  {r.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TODAS_LAS_VISTAS.map((vista, idx) => (
              <tr
                key={vista}
                style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}
              >
                <td style={tdStyle}>{VISTAS_LABELS[vista]}</td>
                {ROLES.map((r) => {
                  const checked = permisos[r.code]?.vistas?.[vista] ?? false;
                  return (
                    <td key={r.code} style={{ ...tdStyle, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermiso(r.code, vista)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        {ROLES.map((r) => (
          <button
            key={r.code}
            className="btn-nuevo"
            style={{ fontSize: "14px" }}
            disabled={guardando === r.code}
            onClick={() => guardarRol(r.code)}
          >
            {guardando === r.code ? "Guardando..." : `Guardar ${r.nombre}`}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Pestaña de Aprobaciones Pendientes ─── */
function TabAprobaciones() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await obtenerUsuariosPendientes();
    if (res.ok) {
      setPendientes(res.data);
      const roles = {};
      res.data.forEach((u) => { roles[u.id] = u.rol || "administrador"; });
      setRolesSeleccionados(roles);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleAprobar = async (usuario) => {
    setProcesando(usuario.id);
    const rol = rolesSeleccionados[usuario.id] || "administrador";
    const res = await aprobarUsuario(usuario.id, rol);
    setProcesando(null);
    if (res.ok) {
      mostrarMensaje("ok", `${usuario.username} aprobado como ${rol}.`);
      await cargar();
    } else {
      mostrarMensaje("error", res.error);
    }
  };

  const handleRechazar = async (usuario) => {
    if (!window.confirm(`¿Rechazar a ${usuario.username}? Su cuenta quedará desactivada.`)) return;
    setProcesando(usuario.id);
    const res = await rechazarUsuario(usuario.id);
    setProcesando(null);
    if (res.ok) {
      mostrarMensaje("ok", `${usuario.username} rechazado.`);
      await cargar();
    } else {
      mostrarMensaje("error", res.error);
    }
  };

  if (cargando) return <p style={{ padding: "24px" }}>Cargando solicitudes...</p>;

  return (
    <div>
      {mensaje && (
        <div
          style={{
            margin: "0 0 16px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
            color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
            fontWeight: 500,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {pendientes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
          <p style={{ fontSize: "48px", margin: "0 0 8px" }}>✓</p>
          <p style={{ fontWeight: 600 }}>No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="estudiantes-grid">
          {pendientes.map((u) => (
            <div key={u.id} className="tarjeta-estudiante">
              <div className="tarjeta-contenido">
                <div className="tarjeta-header">
                  <div className="tarjeta-icono">
                    <span className="bi bi-person-circle"></span>
                  </div>
                  <div>
                    <h3>
                      {u.first_name || u.last_name
                        ? `${u.first_name} ${u.last_name}`.trim()
                        : u.username}
                    </h3>
                    <p className="cedula">@{u.username}</p>
                  </div>
                </div>

                <div className="tarjeta-detalle">
                  <p>
                    <span className="bi bi-envelope-fill"></span> {u.email}
                  </p>
                  <p style={{ marginTop: "8px", fontWeight: 600, fontSize: "13px" }}>
                    Asignar rol:
                  </p>
                  <select
                    value={rolesSeleccionados[u.id] || "administrador"}
                    onChange={(e) =>
                      setRolesSeleccionados((prev) => ({ ...prev, [u.id]: e.target.value }))
                    }
                    style={selectStyle}
                    disabled={procesando === u.id}
                  >
                    {ROLES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="tarjeta-acciones-vertical">
                <button
                  className="btn-accion btn-editar"
                  title="Aprobar"
                  disabled={procesando === u.id}
                  onClick={() => handleAprobar(u)}
                  style={{ background: "#059669", color: "#fff" }}
                >
                  <span className="bi bi-check-circle"></span>
                </button>
                <button
                  className="btn-accion btn-eliminar"
                  title="Rechazar"
                  disabled={procesando === u.id}
                  onClick={() => handleRechazar(u)}
                >
                  <span className="bi bi-x-circle"></span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Vista principal ─── */
function VistaPermisos() {
  const [tab, setTab] = useState("aprobaciones");

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Administración de Permisos</h1>
          <p>Gestione roles, accesos y solicitudes de nuevos usuarios.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0" }}>
        {[
          { id: "aprobaciones", label: "Solicitudes Pendientes" },
          { id: "permisos", label: "Permisos por Rol" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? "#1d4ed8" : "#6b7280",
              borderBottom: tab === t.id ? "2px solid #1d4ed8" : "2px solid transparent",
              marginBottom: "-2px",
              fontSize: "15px",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "aprobaciones" ? <TabAprobaciones /> : <TabPermisos />}
    </div>
  );
}

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "13px",
  color: "#374151",
  border: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "10px 16px",
  fontSize: "14px",
  color: "#374151",
  border: "1px solid #e2e8f0",
};

const selectStyle = {
  marginTop: "4px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  fontSize: "13px",
  width: "100%",
  background: "#fff",
};

export default VistaPermisos;
export { BadgeRol };
