import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import Modal from "../componentes/ui/Modal";
import CampoTexto from "../componentes/ui/CampoTexto";
import BotonPrincipal from "../componentes/ui/BotonPrincipal";
import { obtenerUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario } from "../api/usuarios";
import { isAdmin } from "../api/auth";

const ROLES = [
  { code: "director",      nombre: "Director" },
  { code: "administrador", nombre: "Administrador" },
  { code: "profesor",      nombre: "Profesor" },
  { code: "encargado",     nombre: "Encargado" },
];

const ROL_COLORS = {
  admin:          { bg: "#1e3a8a", text: "#fff" },
  director:       { bg: "#065f46", text: "#fff" },
  administrador:  { bg: "#92400e", text: "#fff" },
  profesor:       { bg: "#4c1d95", text: "#fff" },
  encargado:      { bg: "#164e63", text: "#fff" },
};

function BadgeRol({ rol }) {
  const c = ROL_COLORS[rol] || { bg: "#6b7280", text: "#fff" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {rol}
    </span>
  );
}

function BadgeEstado({ aprobado }) {
  return (
    <span
      style={{
        background: aprobado ? "#d1fae5" : "#fef3c7",
        color: aprobado ? "#065f46" : "#92400e",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {aprobado ? "Aprobado" : "Pendiente"}
    </span>
  );
}

function FormularioUsuario({ onGuardar, onCancelar, datosIniciales }) {
  const esEdicion = !!datosIniciales;
  const admin = isAdmin();

  const [form, setForm] = useState({
    username:  datosIniciales?.username   || "",
    nombre:    datosIniciales?.first_name || "",
    apellido:  datosIniciales?.last_name  || "",
    email:     datosIniciales?.email      || "",
    password:  "",
    rol:       datosIniciales?.rol        || "administrador",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!esEdicion) {
      if (!form.username || !form.email || !form.password) {
        setError("Username, email y contraseña son obligatorios.");
        return;
      }
      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    } else {
      if (!form.email) {
        setError("El email es obligatorio.");
        return;
      }
    }

    setCargando(true);
    let resultado;

    if (esEdicion) {
      resultado = await actualizarUsuario(datosIniciales.id, {
        first_name: form.nombre,
        last_name:  form.apellido,
        email:      form.email,
        rol:        form.rol,
      });
    } else {
      resultado = await crearUsuario({
        username: form.username,
        email:    form.email,
        nombre:   form.nombre,
        apellido: form.apellido,
        password: form.password,
        rol:      form.rol,
      });
    }

    setCargando(false);
    if (!resultado.ok) { setError(resultado.error); return; }
    onGuardar();
  };

  return (
    <form onSubmit={manejarEnvio} className="formulario-autenticacion" style={{ padding: "0" }}>
      {error && <div className="mensaje-error-login">{error}</div>}

      {!esEdicion && (
        <CampoTexto
          etiqueta="Nombre de usuario"
          tipo="text"
          placeholder="usuario123"
          value={form.username}
          onChange={cambiar("username")}
          disabled={cargando}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <CampoTexto
          etiqueta="Nombre"
          tipo="text"
          placeholder="Juan"
          value={form.nombre}
          onChange={cambiar("nombre")}
          disabled={cargando}
        />
        <CampoTexto
          etiqueta="Apellido"
          tipo="text"
          placeholder="Pérez"
          value={form.apellido}
          onChange={cambiar("apellido")}
          disabled={cargando}
        />
      </div>

      <CampoTexto
        etiqueta="Correo electrónico"
        tipo="email"
        placeholder="usuario@ejemplo.com"
        value={form.email}
        onChange={cambiar("email")}
        disabled={cargando}
      />

      {!esEdicion && (
        <CampoTexto
          etiqueta="Contraseña"
          tipo="password"
          placeholder="••••••••"
          value={form.password}
          onChange={cambiar("password")}
          disabled={cargando}
        />
      )}

      {admin && (
        <div style={{ marginTop: "4px" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#374151", display: "block", marginBottom: "4px" }}>
            Rol
          </label>
          <select
            value={form.rol}
            onChange={cambiar("rol")}
            disabled={cargando}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              background: "#fff",
            }}
          >
            {ROLES.map((r) => (
              <option key={r.code} value={r.code}>{r.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <button type="button" className="btn-cancelar" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </button>
        <BotonPrincipal tipo="submit" disabled={cargando}>
          {cargando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear usuario"}
        </BotonPrincipal>
      </div>
    </form>
  );
}

function VistaUsuarios() {
  const [modo, setModo] = useState("lista");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const admin = isAdmin();

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarUsuarios(); }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchEstado =
      filtroEstado === "todos"    ? true :
      filtroEstado === "activos"  ? u.is_active :
      !u.is_active;

    const termino = busqueda.toLowerCase();
    const matchBusqueda =
      !termino ||
      u.username?.toLowerCase().includes(termino) ||
      u.email?.toLowerCase().includes(termino) ||
      u.first_name?.toLowerCase().includes(termino) ||
      u.last_name?.toLowerCase().includes(termino);

    return matchEstado && matchBusqueda;
  });

  const manejarGuardar = async () => {
    await cargarUsuarios();
    setModo("lista");
    setUsuarioEditando(null);
  };

  const manejarCancelar = () => {
    setModo("lista");
    setUsuarioEditando(null);
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    const result = await desactivarUsuario(usuarioAEliminar.id);
    if (!result.ok) { alert(result.error); return; }
    await cargarUsuarios();
    setModalEliminarOpen(false);
    setUsuarioAEliminar(null);
  };

  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Usuario" : "Editar Usuario"}</h1>
            <p>
              {modo === "nuevo"
                ? "Registre los datos del nuevo usuario del sistema."
                : "Modifique los datos del usuario."}
            </p>
          </div>
        </div>
        <div style={{ maxWidth: "520px", marginTop: "24px" }}>
          <FormularioUsuario
            onGuardar={manejarGuardar}
            onCancelar={manejarCancelar}
            datosIniciales={modo === "editar" ? usuarioEditando : null}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="estudiantes"><p>Cargando usuarios...</p></div>;
  }

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administre los usuarios del sistema EduCRM</p>
        </div>
        {admin && (
          <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
            + Nuevo Usuario
          </button>
        )}
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por username, nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="filtro-niveles">
          {[
            { label: "Activos",   value: "activos" },
            { label: "Inactivos", value: "inactivos" },
            { label: "Todos",     value: "todos" },
          ].map((f) => (
            <button
              key={f.value}
              className={filtroEstado === f.value ? "activo" : ""}
              onClick={() => setFiltroEstado(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="estudiantes-grid">
        {usuariosFiltrados.map((u) => (
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
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <BadgeRol rol={u.rol || "—"} />
                  <BadgeEstado aprobado={u.aprobado} />
                  {!u.is_active && (
                    <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>
                      Inactivo
                    </span>
                  )}
                </div>
                <p>
                  <span className="bi bi-envelope-fill"></span> {u.email}
                </p>
              </div>
            </div>

            {admin && (
              <div className="tarjeta-acciones-vertical">
                <button
                  className="btn-accion btn-editar"
                  onClick={() => { setUsuarioEditando(u); setModo("editar"); }}
                  title="Editar"
                >
                  <span className="bi bi-pencil-square"></span>
                </button>
                <button
                  className="btn-accion btn-eliminar"
                  onClick={() => { setUsuarioAEliminar(u); setModalEliminarOpen(true); }}
                  title="Desactivar"
                  disabled={!u.is_active || u.is_superuser}
                >
                  <span className="bi bi-person-x"></span>
                </button>
              </div>
            )}
          </div>
        ))}

        {usuariosFiltrados.length === 0 && (
          <p>No se encontraron usuarios.</p>
        )}
      </div>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={() => { setModalEliminarOpen(false); setUsuarioAEliminar(null); }}
        title="Confirmar desactivación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas desactivar al usuario{" "}
            <strong>{usuarioAEliminar?.username}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => { setModalEliminarOpen(false); setUsuarioAEliminar(null); }}
            >
              Cancelar
            </button>
            <button type="button" className="btn-eliminar-modal" onClick={confirmarEliminar}>
              Desactivar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VistaUsuarios;
