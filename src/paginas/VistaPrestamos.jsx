import React, { useEffect, useState, useCallback } from "react";
import "../recursos/estilos/VistaActivos.css";
import FormularioPrestamo from "./FormularioPrestamo";
import Modal from "../componentes/ui/Modal";
import { obtenerPrestamos, crearPrestamo, registrarDevolucion } from "../api/prestamos";

function VistaPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [busqueda, setBusqueda] = useState("");

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalDevolucionOpen, setModalDevolucionOpen] = useState(false);
  const [prestamoADevolver, setPrestamoADevolver] = useState(null);
  const [fechaDevolucion, setFechaDevolucion] = useState(
    new Date().toISOString().split("T")[0]
  );

  const cargarPrestamos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerPrestamos({ estado: filtroEstado });
      setPrestamos(data);
    } catch (err) {
      console.error("Error cargando préstamos:", err);
      alert("Error cargando préstamos desde el servidor");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const prestamosFiltrados = prestamos.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      (p.activo_nombre && p.activo_nombre.toLowerCase().includes(q)) ||
      (p.estudiante_nombre && p.estudiante_nombre.toLowerCase().includes(q)) ||
      (p.estudiante_cedula && p.estudiante_cedula.toLowerCase().includes(q))
    );
  });

  const manejarNuevoPrestamo = async (formData) => {
    const result = await crearPrestamo(formData);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    alert(result.data?.mensaje || "Préstamo registrado exitosamente.");
    setModalNuevoOpen(false);
    await cargarPrestamos();
  };

  const abrirDevolucion = (prestamo) => {
    setPrestamoADevolver(prestamo);
    setFechaDevolucion(new Date().toISOString().split("T")[0]);
    setModalDevolucionOpen(true);
  };

  const confirmarDevolucion = async () => {
    if (!prestamoADevolver) return;
    const result = await registrarDevolucion(
      prestamoADevolver.id_prestamo,
      fechaDevolucion
    );
    if (!result.ok) {
      alert(result.error);
      return;
    }
    alert(result.data?.mensaje || "Devolución registrada exitosamente.");
    setModalDevolucionOpen(false);
    setPrestamoADevolver(null);
    await cargarPrestamos();
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    return new Date(fechaStr + "T00:00:00").toLocaleDateString("es-CR");
  };

  return (
    <div className="estudiantes">
      <div className="estudiantes-header">
        <div>
          <h1>Préstamos de Activos</h1>
          <p>Historial y gestión de préstamos</p>
        </div>
        <button className="btn-nuevo" onClick={() => setModalNuevoOpen(true)}>
          + Nuevo Préstamo
        </button>
      </div>

      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por activo, estudiante o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="filtro-niveles">
          {[
            { label: "Activos", value: "activo" },
            { label: "Devueltos", value: "devuelto" },
            { label: "Todos", value: "" },
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

      {loading ? (
        <p>Cargando préstamos...</p>
      ) : (
        <div className="tabla-prestamos-contenedor">
          {prestamosFiltrados.length === 0 ? (
            <p>No se encontraron préstamos.</p>
          ) : (
            <table className="tabla-prestamos">
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Tipo</th>
                  <th>Estudiante</th>
                  <th>Cédula</th>
                  <th>Fecha préstamo</th>
                  <th>Retorno esperado</th>
                  <th>Retorno real</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamosFiltrados.map((p) => (
                  <tr key={p.id_prestamo}>
                    <td>{p.activo_nombre}</td>
                    <td>{p.activo_tipo}</td>
                    <td>{p.estudiante_nombre}</td>
                    <td>{p.estudiante_cedula}</td>
                    <td>{formatFecha(p.fecha_prestamo)}</td>
                    <td>{formatFecha(p.fecha_retorno_esperada)}</td>
                    <td>{formatFecha(p.fecha_retorno_real)}</td>
                    <td>
                      <span
                        className={`badge-estado ${
                          p.estado_prestamo === "activo"
                            ? "badge-prestado"
                            : "badge-disponible"
                        }`}
                      >
                        {p.estado_prestamo === "activo" ? "Activo" : "Devuelto"}
                      </span>
                    </td>
                    <td>
                      {p.estado_prestamo === "activo" && (
                        <button
                          className="btn-devolver"
                          onClick={() => abrirDevolucion(p)}
                        >
                          Registrar devolución
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Nuevo Préstamo"
        size="wide"
      >
        {modalNuevoOpen && (
          <FormularioPrestamo
            onGuardar={manejarNuevoPrestamo}
            onCancelar={() => setModalNuevoOpen(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalDevolucionOpen}
        onClose={() => { setModalDevolucionOpen(false); setPrestamoADevolver(null); }}
        title="Registrar Devolución"
        size="wide"
      >
        <div className="modal-confirmacion-contenido">
          <p className="modal-confirmacion-texto">
            Confirmar devolución de{" "}
            <strong>{prestamoADevolver?.activo_nombre}</strong> por parte de{" "}
            <strong>{prestamoADevolver?.estudiante_nombre}</strong>.
          </p>
          <div className="campo" style={{ marginBottom: "16px" }}>
            <label>Fecha de devolución real</label>
            <input
              type="date"
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => { setModalDevolucionOpen(false); setPrestamoADevolver(null); }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-guardar"
              onClick={confirmarDevolucion}
            >
              Confirmar devolución
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VistaPrestamos;
