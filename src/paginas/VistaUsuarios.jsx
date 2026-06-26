import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import Modal from "../componentes/ui/Modal";
import CampoTexto from "../componentes/ui/CampoTexto";
import BotonPrincipal from "../componentes/ui/BotonPrincipal";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
} from "../api/usuarios";

function FormularioUsuario({ onGuardar, onCancelar, datosIniciales }) {
  const esEdicion = !!datosIniciales;
  const [form, setForm] = useState({
    username: datosIniciales?.username || "",
    nombre: datosIniciales?.first_name || "",
    apellido: datosIniciales?.last_name || "",
    email: datosIniciales?.email || "",
    password: "",
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
        last_name: form.apellido,
        email: form.email,
      });
    } else {
      resultado = await crearUsuario({
        username: form.username,
        email: form.email,
        nombre: form.nombre,
        password: form.password,
      });
    }

    setCargando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

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

      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
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

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activos"
        ? u.is_active
        : !u.is_active;

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

  const manejarEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModo("editar");
  };

  const manejarEliminar = (usuario) => {
    setUsuarioAEliminar(usuario);
    setModalEliminarOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    const result = await desactivarUsuario(usuarioAEliminar.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    await cargarUsuarios();
    setModalEliminarOpen(false);
    setUsuarioAEliminar(null);
  };

  const cancelarEliminar = () => {
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
        <div style={{ maxWidth: "480px", marginTop: "24px" }}>
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
    return (
      <div className="estudiantes">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administre los usuarios del sistema EduCRM</p>
        </div>
        <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
          + Nuevo Usuario
        </button>
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
            { label: "Activos", value: "activos" },
            { label: "Inactivos", value: "inactivos" },
            { label: "Todos", value: "todos" },
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
                  <p className="cedula">{u.username}</p>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <span className={`nivel ${u.is_active ? "verde" : ""}`}>
                  {u.is_active ? "Activo" : "Inactivo"}
                </span>
                <p>
                  <span className="bi bi-envelope-fill"></span> {u.email}
                </p>
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button
                className="btn-accion btn-editar"
                onClick={() => manejarEditar(u)}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => manejarEliminar(u)}
                title="Desactivar"
                disabled={!u.is_active}
              >
                <span className="bi bi-person-x"></span>
              </button>
            </div>
          </div>
        ))}

        {usuariosFiltrados.length === 0 && (
          <p>No se encontraron usuarios.</p>
        )}
      </div>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar desactivación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas desactivar al usuario{" "}
            <strong>{usuarioAEliminar?.username}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn-cancelar" onClick={cancelarEliminar}>
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
