import React, { useEffect, useState, useCallback } from "react";
import "../recursos/estilos/VistaActivos.css";
import FormularioActivo from "./FormularioActivo";
import FormularioPrestamo from "./FormularioPrestamo";
import Modal from "../componentes/ui/Modal";
import DetalleActivo from "../componentes/ui/DetalleActivo";
import ImportarActivosCSV from "../componentes/ui/ImportarActivosCSV";
import {
  obtenerActivos,
  crearActivo,
  actualizarActivo,
  eliminarActivo,
} from "../api/activos";
import { crearPrestamo } from "../api/prestamos";

const ETIQUETAS_TIPO = {
  computadora: "Computadora",
  tablet: "Tablet",
  libro: "Libro",
  proyector: "Proyector",
  otro: "Otro",
};

function VistaActivos() {
  const [modo, setModo] = useState("lista");
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [activoEditando, setActivoEditando] = useState(null);

  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [activoAEliminar, setActivoAEliminar] = useState(null);

  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [activoViendo, setActivoViendo] = useState(null);

  const [modalPrestamoOpen, setModalPrestamoOpen] = useState(false);
  const [activoParaPrestar, setActivoParaPrestar] = useState(null);

  const [modalImportOpen, setModalImportOpen] = useState(false);

  const cargarActivos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerActivos({
        busqueda,
        estado: filtroEstado,
        tipo: filtroTipo,
      });
      setActivos(data);
    } catch (err) {
      console.error("Error cargando activos:", err);
      alert("Error cargando activos desde el servidor");
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroEstado, filtroTipo]);

  useEffect(() => {
    cargarActivos();
  }, [cargarActivos]);

  const manejarGuardar = async (formData) => {
    if (activoEditando) {
      const payload = {
        tipo: formData.tipo,
        nombre: formData.nombre,
        estado: formData.estado,
      };
      const result = await actualizarActivo(activoEditando.id_activo, payload);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      alert(result.data?.mensaje || "Activo actualizado exitosamente.");
      await cargarActivos();
      setModo("lista");
      setActivoEditando(null);
    } else {
      const result = await crearActivo(formData);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      await cargarActivos();
      setModo("lista");
    }
  };

  const manejarEliminar = (activo) => {
    setActivoAEliminar(activo);
    setModalEliminarOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!activoAEliminar) return;
    const result = await eliminarActivo(activoAEliminar.id_activo);
    if (!result.ok) {
      alert(result.error);
      setModalEliminarOpen(false);
      setActivoAEliminar(null);
      return;
    }
    alert(result.mensaje || "Activo eliminado exitosamente.");
    await cargarActivos();
    setModalEliminarOpen(false);
    setActivoAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalEliminarOpen(false);
    setActivoAEliminar(null);
  };

  const manejarEditar = (activo) => {
    setActivoEditando(activo);
    setModo("editar");
  };

  const manejarVer = (activo) => {
    setActivoViendo(activo);
    setModalVerOpen(true);
  };

  const manejarPrestar = (activo) => {
    setActivoParaPrestar(activo);
    setModalPrestamoOpen(true);
  };

  const confirmarPrestamo = async (formData) => {
    const result = await crearPrestamo(formData);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    alert(result.data?.mensaje || "Préstamo registrado exitosamente.");
    setModalPrestamoOpen(false);
    setActivoParaPrestar(null);
    await cargarActivos();
  };

  const estadoBadgeClass = (estado) => {
    if (estado === "disponible") return "badge-disponible";
    if (estado === "prestado") return "badge-prestado";
    return "badge-mantenimiento";
  };

  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Activo" : "Editar Activo"}</h1>
            <p>
              {modo === "nuevo"
                ? "Registre los datos del activo."
                : "Modifique los datos del activo."}
            </p>
          </div>
        </div>
        <FormularioActivo
          onGuardar={manejarGuardar}
          onCancelar={() => {
            setModo("lista");
            setActivoEditando(null);
          }}
          datosIniciales={activoEditando}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estudiantes">
        <p>Cargando activos...</p>
      </div>
    );
  }

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Activos</h1>
          <p>Administre los activos del CCSP</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
            + Nuevo Activo
          </button>
          <button 
            className="btn-importar" 
            onClick={() => setModalImportOpen(true)}
            style={{
              backgroundColor: '#4472C4',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📥 Importar CSV
          </button>
        </div>
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o tipo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="filtro-niveles">
          {[
            { label: "Todos", value: "" },
            { label: "Disponibles", value: "disponible" },
            { label: "Prestados", value: "prestado" },
            { label: "Mantenimiento", value: "en_mantenimiento" },
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

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="select-filtro-tipo"
        >
          <option value="">Todos los tipos</option>
          <option value="computadora">Computadora</option>
          <option value="tablet">Tablet</option>
          <option value="libro">Libro</option>
          <option value="proyector">Proyector</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="estudiantes-grid">
        {activos.map((a) => (
          <div key={a.id_activo} className="tarjeta-estudiante">
            <div className="tarjeta-contenido">
              <div className="tarjeta-header">
                <div className="tarjeta-icono">
                  <span className="bi bi-box-seam"></span>
                </div>
                <div>
                  <h3>{a.nombre}</h3>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <span className="nivel verde">{ETIQUETAS_TIPO[a.tipo] || a.tipo}</span>
                <span className={`badge-estado ${estadoBadgeClass(a.estado)}`}>
                  {a.estado === "disponible"
                    ? "Disponible"
                    : a.estado === "prestado"
                    ? "Prestado"
                    : "En mantenimiento"}
                </span>

                {a.prestamo_activo && (
                  <p style={{ fontSize: "13px", color: "#92400e", marginTop: "6px" }}>
                    <span className="bi bi-person"></span>{" "}
                    {a.prestamo_activo.estudiante_nombre}
                    <br />
                    <span style={{ color: "#6b7280" }}>
                      Retorno:{" "}
                      {new Date(
                        a.prestamo_activo.fecha_retorno_esperada + "T00:00:00"
                      ).toLocaleDateString("es-CR")}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button
                className="btn-accion btn-ver"
                onClick={() => manejarVer(a)}
                title="Ver detalles"
              >
                <span className="bi bi-eye"></span>
              </button>
              <button
                className="btn-accion btn-editar"
                onClick={() => manejarEditar(a)}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-prestar"
                onClick={() => manejarPrestar(a)}
                title={
                  a.estado !== "disponible"
                    ? "Solo se pueden prestar activos disponibles"
                    : "Prestar"
                }
                disabled={a.estado !== "disponible"}
              >
                <span className="bi bi-arrow-right-circle"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => manejarEliminar(a)}
                title="Eliminar"
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}

        {activos.length === 0 && (
          <p>No se encontraron activos.</p>
        )}
      </div>

      <Modal
        isOpen={modalVerOpen}
        onClose={() => { setModalVerOpen(false); setActivoViendo(null); }}
        title={activoViendo ? activoViendo.nombre : "Detalles del Activo"}
      >
        {activoViendo && <DetalleActivo activo={activoViendo} />}
      </Modal>

      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar eliminación"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            ¿Seguro que deseas eliminar el activo{" "}
            <strong>{activoAEliminar?.nombre}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn-cancelar" onClick={cancelarEliminar}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-eliminar-modal"
              onClick={confirmarEliminar}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalPrestamoOpen}
        onClose={() => { setModalPrestamoOpen(false); setActivoParaPrestar(null); }}
        title="Registrar Préstamo"
        size="wide"
      >
        {modalPrestamoOpen && (
          <FormularioPrestamo
            onGuardar={confirmarPrestamo}
            onCancelar={() => { setModalPrestamoOpen(false); setActivoParaPrestar(null); }}
            activoPreseleccionado={activoParaPrestar}
          />
        )}
      </Modal>

      {modalImportOpen && (
        <ImportarActivosCSV 
          onClose={() => setModalImportOpen(false)}
          onFinalizar={() => cargarActivos()}
        />
      )}
    </div>
  );
}

export default VistaActivos;
