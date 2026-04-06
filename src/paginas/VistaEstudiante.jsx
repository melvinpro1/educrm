
import React, { useEffect, useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioEstudiante from "./FormularioEstudiante";
import Modal from "../componentes/ui/Modal";
import DetalleEstudiante from "../componentes/ui/DetalleEstudiante";
import {
  getEstudiantes,
  deleteEstudiante,
  createEstudiante,
  updateEstudiante,
} from "../api/estudiantes";

function Estudiantes() {
  const [modo, setModo] = useState("lista"); // "lista" | "nuevo" | "editar"
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estudianteEditando, setEstudianteEditando] = useState(null); // Nuevo esta
  const [estudianteViendo, setEstudianteViendo] = useState(null); //  Estudiante a visualizar
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  

  //Cargar estudiantes desde el back
  async function cargarEstudiantes() {
    setLoading(true);
    try {
      const data = await getEstudiantes(filtroEstado);
      setEstudiantes(data);
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      alert("Error cargando estudiantes desde el servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEstudiantes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  // 🔹 Filtra por nivel (usando 'grado' que viene del backend)
  const filtrarPorNivel = (lista) => {
    if (filtroNivel === "Todos") return lista;
    return lista.filter((e) => e.grado === filtroNivel);
  };

  // 🔹 Filtra por nombre o cédula
  const filtrarPorBusqueda = (lista) =>
    lista.filter(
      (e) =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.cedula && e.cedula.includes(busqueda))
    );

  const estudiantesFiltrados = filtrarPorBusqueda(
    filtrarPorNivel(estudiantes)
  );

  // 🔹 Guardar estudiante desde el formulario (POST o PUT)
  const manejarGuardarEstudiante = async (formData) => {
    // Si hay estudianteEditando, hacemos UPDATE, sino CREATE
    if (estudianteEditando) {
      // Modo edición - NO enviamos datos del encargado
      const payload = {
        nombre: formData.nombre,
        correo_institucional: formData.correoInstitucional,
        correo_personal: formData.correoPersonal,
        telefono: formData.telefono,
        colegio_procedencia: formData.colegioProcedencia,
        grado: formData.grado,
        direccion_domicilio: formData.direccion,
        // NO incluimos encargado - se edita en su propia sección
      };

      const result = await updateEstudiante(estudianteEditando.id_estudiante, payload);

      if (!result.ok) {
        alert(result.error);
        return; // No limpiar si hay error
      }

      // Éxito: recargar y limpiar
      await cargarEstudiantes();
      setModo("lista");
      setEstudianteEditando(null);
    } else {
      // Modo creación - SÍ enviamos datos del encargado
      const result = await createEstudiante(formData);

      if (!result.ok) {
        alert(result.error);
        return; // No limpiar si hay error - el formulario mantiene los datos
      }

      // Éxito: recargar y volver a lista
      await cargarEstudiantes();
      setModo("lista");
    }
  };

  // 🔹 Cancelar formulario
  const manejarCancelar = () => {
    setModo("lista");
    setEstudianteEditando(null); // 🔹 Limpiar estudiante en edición
  };

  //  Eliminar estudiante (DELETE real)
 const manejarEliminar = (estudiante) => {
  setEstudianteAEliminar(estudiante);
  setModalEliminarOpen(true);
};

const confirmarEliminar = async () => {
  if (!estudianteAEliminar) return;

  const result = await deleteEstudiante(estudianteAEliminar.id_estudiante);

  if (!result.ok) {
    alert(result.error);
    return;
  }

  await cargarEstudiantes();
  setModalEliminarOpen(false);
  setEstudianteAEliminar(null);
};

const cancelarEliminar = () => {
  setModalEliminarOpen(false);
  setEstudianteAEliminar(null);
};
  // 🔹 Editar estudiante - ahora usa el formulario completo
  const manejarEditar = (est) => {
    setEstudianteEditando(est);
    setModo("editar");
  };

  // 🔹 Ver detalles de estudiante
  const manejarVer = (est) => {
    setEstudianteViendo(est);
    setModalVerOpen(true);
  };

  // 🔹 Cerrar modal de ver
  const cerrarModalVer = () => {
    setModalVerOpen(false);
    setEstudianteViendo(null);
  };

  // Si está en modo formulario: mostramos solo el form
  if (modo === "nuevo" || modo === "editar") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>{modo === "nuevo" ? "Nuevo Estudiante" : "Editar Estudiante"}</h1>
            <p>
              {modo === "nuevo"
                ? "Registre los datos del estudiante y su encargado. Ambos se guardarán juntos."
                : "Modifique los datos del estudiante y su encargado."}
            </p>
          </div>
        </div>

        <FormularioEstudiante
          onGuardar={manejarGuardarEstudiante}
          onCancelar={manejarCancelar}
          datosIniciales={estudianteEditando} // 🔹 Pasar datos si es edición
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estudiantes">
        <p>Cargando estudiantes...</p>
      </div>
    );
  }

  // 🔹 MODO LISTA (vista normal)
  return (
    <div className="estudiantes">
      {/* Encabezado con botón */}
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Estudiantes</h1>
          <p>Administre la información de los estudiantes del CCSP</p>
        </div>
        <button className="btn-nuevo" onClick={() => setModo("nuevo")}>
          + Nuevo Estudiante
        </button>
      </div>

      {/* Buscador + filtros */}
      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="filtro-grupo">
          <span className="filtro-etiqueta">Estado</span>
          <div className="filtro-niveles">
            {[
              { label: "Activos", value: "activos" },
              { label: "Inactivos", value: "inactivos" },
              { label: "Todos", value: "todos" },
            ].map((filtro) => (
              <button
                key={filtro.value}
                className={filtroEstado === filtro.value ? "activo" : ""}
                onClick={() => setFiltroEstado(filtro.value)}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-grupo">
          <span className="filtro-etiqueta">Nivel</span>
          <div className="filtro-niveles">
            {["Cuarto Nivel", "Quinto Nivel", "Todos"].map((nivel) => (
              <button
                key={nivel}
                className={filtroNivel === nivel ? "activo" : ""}
                onClick={() => setFiltroNivel(nivel)}
              >
                {nivel === "Todos" ? "Todos" : nivel === "Cuarto Nivel" ? "Cuarto" : "Quinto"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas de estudiantes */}
      <div className="estudiantes-grid">
        {estudiantesFiltrados.map((e) => (
          <div key={e.id_estudiante} className="tarjeta-estudiante">
            <div className="tarjeta-contenido">
              <div className="tarjeta-header">
                <div className="tarjeta-icono"><span className="bi bi-person-circle"></span></div>
                <div>
                  <h3>{e.nombre}</h3>
                  <p className="cedula">{e.cedula}</p>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <span
                  className={
                    "nivel " +
                    (e.grado === "Cuarto Nivel" ? "violeta" : "verde")
                  }
                >
                  {e.grado}
                </span>
                <span className="estado">
                  {e.activo ? "activo" : "inactivo"}
                </span>

                <p><span className="bi bi-envelope-fill"></span> {e.correo_institucional}</p>
                {e.correo_personal && <p><span className="bi bi-envelope-fill"></span> Pers.: {e.correo_personal}</p>}
                {e.encargado && (
                  <p><span className="bi bi-person-fill"></span> Encargado: {e.encargado.nombre}</p>
                )}
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button 
                className="btn-accion btn-ver" 
                onClick={() => manejarVer(e)}
                title="Ver detalles"
              >
                <span className="bi bi-eye"></span>
              </button>
              <button
                className="btn-accion btn-editar"
                onClick={() => manejarEditar(e)}
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

        {estudiantesFiltrados.length === 0 && (
          <p>No se encontraron estudiantes.</p>
        )}
      </div>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={modalVerOpen}
        onClose={cerrarModalVer}
        title={estudianteViendo ? estudianteViendo.nombre : "Detalles del Estudiante"}
      >
        {estudianteViendo && <DetalleEstudiante estudiante={estudianteViendo} />}
      </Modal>
      <Modal
        isOpen={modalEliminarOpen}
        onClose={cancelarEliminar}
        title="Confirmar eliminación"
        size="wide"
>
    <div className="modal-confirmacion-contenido">
      <p className="modal-confirmacion-texto">
        ¿Seguro que deseas eliminar al estudiante{" "}
        <strong>{estudianteAEliminar?.nombre}</strong>?
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
    </div>
  );
}

export default Estudiantes;

