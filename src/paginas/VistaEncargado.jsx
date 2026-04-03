
import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioEncargado from "./FormularioEncargado";
import Modal from "../componentes/ui/Modal";
import DetalleEncargado from "../componentes/ui/DetalleEncargado";
import { getEncargados, deleteEncargado, updateEncargado } from "../api/encargados";

function Encargados() {
  const [modo, setModo] = useState("lista"); // "lista" | "editar"
  const [busqueda, setBusqueda] = useState("");
  const [encargados, setEncargados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [encargadoEditando, setEncargadoEditando] = useState(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [encargadoViendo, setEncargadoViendo] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [encargadoAEliminar, setEncargadoAEliminar] = useState(null);
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");

  // Cargar encargados desde el backend
  async function cargarEncargados() {
    setLoading(true);
    const data = await getEncargados(busqueda);
    setEncargados(data);
    setLoading(false);
  }

  // Cargar al inicio
  useEffect(() => {
    cargarEncargados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar por nombre en el front (además del search del back, si quieres)
  const encargadosFiltrados = encargados.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🔹 Guardar encargado desde el formulario (solo edición)
  const manejarGuardarEncargado = async (formData) => {
    const result = await updateEncargado(encargadoEditando.id_encargado, formData);

    if (!result.ok) {
      alert(result.error);
      return;
    }

    await cargarEncargados();
    setModo("lista");
    setEncargadoEditando(null);
  };

  const manejarCancelar = () => {
  setModo("lista");
  setEncargadoEditando(null);
};

  // 🔹 Cancelar formulario
 const manejarEliminar = (encargado) => {
  setEncargadoAEliminar(encargado);
  setModalEliminarOpen(true);
};

const confirmarEliminar = async () => {
  if (!encargadoAEliminar) return;

  const result = await deleteEncargado(encargadoAEliminar.id_encargado);

 if (!result.ok) {
  setModalEliminarOpen(false);
  setMensajeModal(result.error || "Ocurrió un error al eliminar el encargado.");
  setModalMensajeOpen(true);
  return;
}

  await cargarEncargados();
  setModalEliminarOpen(false);
  setEncargadoAEliminar(null);
};

const cancelarEliminar = () => {
  setModalEliminarOpen(false);
  setEncargadoAEliminar(null);
};

const cerrarModalMensaje = () => {
  setModalMensajeOpen(false);
  setMensajeModal("");
};

  async function handleEdit(enc) {
    setEncargadoEditando(enc);
    setModo("editar");
  }

  // Ver detalles de encargado
  function handleVer(enc) {
    setEncargadoViendo(enc);
    setModalVerOpen(true);
  }

  // Cerrar modal de ver
  function cerrarModalVer() {
    setModalVerOpen(false);
    setEncargadoViendo(null);
  }

  // Si quieres que el buscador dispare petición al back:
  // useEffect(() => { cargarEncargados(); }, [busqueda]);

  // Si está en modo formulario: mostramos solo el form
  if (modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>Editar Encargado</h1>
            <p>
              Modifique los datos del encargado. Los cambios se aplicarán a todos los estudiantes asociados.
            </p>
          </div>
        </div>

        <FormularioEncargado
          onGuardar={manejarGuardarEncargado}
          onCancelar={manejarCancelar}
          datosIniciales={encargadoEditando}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estudiantes">
        <p>Cargando encargados...</p>
      </div>
    );
  }

  return (
    <div className="estudiantes">
      {/* Encabezado */}
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Encargados</h1>
          <p>Administre la información de los encargados del CCSP</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tarjetas de encargados (usa el mismo CSS de estudiantes) */}
      <div className="estudiantes-grid">
        {encargadosFiltrados.map((e) => (
          <div
            key={e.id_encargado}
            className="tarjeta-estudiante"
          >
            <div className="tarjeta-contenido">
              <div className="tarjeta-header">
                <div className="tarjeta-icono"><span className="bi-person-circle"></span></div>
                <div>
                  <h3>{e.nombre}</h3>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <p> <span className="bi bi-envelope-fill"></span> {e.correo}</p>
                <p><span className="bi bi-telephone-fill"></span> {e.telefono}</p>
                {/* para contar estudiantes, aquí se puede agregar un campo extra */}
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button 
                className="btn-accion btn-ver"
                onClick={() => handleVer(e)}
                title="Ver detalles"
              >
                <span className="bi bi-eye"></span>
              </button>
              <button 
                className="btn-accion btn-editar" 
                onClick={() => handleEdit(e)}
                title="Editar"
              >
                <span className="bi bi-pencil-square"></span>
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => manejarEliminar(e)}
                title="Eliminar"
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}

        {encargadosFiltrados.length === 0 && (
          <p>No se encontraron encargados.</p>
        )}
      </div>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={modalVerOpen}
        onClose={cerrarModalVer}
        title={encargadoViendo ? encargadoViendo.nombre : "Detalles del Encargado"}
      >
        {encargadoViendo && <DetalleEncargado encargado={encargadoViendo} />}
      </Modal>
      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar eliminación"
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ marginBottom: "16px", color: "#374151" }}>
            ¿Seguro que deseas eliminar al encargado{" "}
            <strong>{encargadoAEliminar?.nombre}</strong>?
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn-cancelar"
              onClick={cancelarEliminar}
            >
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
                isOpen={modalMensajeOpen}
              onClose={cerrarModalMensaje}
              title="Aviso"
              size="small"
            >
              <div className="modal-mensaje-contenido">
                <p className="modal-mensaje-texto">{mensajeModal}</p>

                <div className="modal-mensaje-acciones">
                  <button
                    type="button"
                    className="btn-aceptar-modal"
                    onClick={cerrarModalMensaje}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
         </Modal>
      </div>
    
  );
}

export default Encargados;

