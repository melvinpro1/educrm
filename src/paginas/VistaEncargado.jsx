// import React, { useState } from "react";
// import "../recursos/estilos/VistaEstudiante.css";

// // 🔹 Datos de ejemplo. Luego se reemplazan con datos reales del backend.
// const datosIniciales = [
//   {
//     nombre: "Sofía Jiménez Rojas",
//     correo: "sofia.jimenez@ccsp.ed.cr",
//     telefono: "8456-2390",
//   },
//   {
//     nombre: "Andrés Mora Solís",
//     correo: "andres.mora@ccsp.ed.cr",
//     telefono: "8867-5421",
//   },
//   {
//     nombre: "Luciana Araya Quesada",
//     correo: "luciana.araya@ccsp.ed.cr",
//     telefono: "7012-4356",
//   },
//   {
//     nombre: "Samuel Vargas Hernández",
//     correo: "samuel.vargas@ccsp.ed.cr",
//     telefono: "8345-1298",
//   },
//   {
//     nombre: "Mariana Rodríguez Coto",
//     correo: "mariana.rodriguez@ccsp.ed.cr",
//     telefono: "8721-0043",
//   },
//   {
//     nombre: "Diego Sánchez Porras",
//     correo: "diego.sanchez@ccsp.ed.cr",
//     telefono: "7298-3311",
//   }
// ];

// //se debe cambiar los datos de ejemplo por datos reales del backend
// //se debe cambiar la forma de filtrar ya que esto esta relacionado con los estudiantes y no con los encargados
// function Engarcados() {
//   const [busqueda, setBusqueda] = useState("");
//   const [filtroNivel, setFiltroNivel] = useState("Todos");
//   const [estudiantes, setEstudiantes] = useState(datosIniciales);

//   // 🔹 Filtra por nivel
//   const filtrarPorNivel = (lista) => {
//     if (filtroNivel === "Todos") return lista;
//     return lista.filter((e) => e.nivel === filtroNivel);
//   };

//   // 🔹 Filtra por nombre o cédula
//   const filtrarPorBusqueda = (lista) =>
//     lista.filter(
//       (e) =>
//         e.nombre.toLowerCase().includes(busqueda.toLowerCase())
//     );

//   const encargadosFiltrados = filtrarPorBusqueda(
//     filtrarPorNivel(estudiantes)
//   );


//   // 🔹 MODO LISTA (vista normal)
//   return (
//     <div className="estudiantes">
//       {/* Encabezado con botón */}
//       <div className="estudiantes-header">
//         <div>
//           <h1>Gestión de Encargados</h1>
//           <p>Administre la información de los encargados del CCSP</p>
//         </div>

//       </div>

//       {/* Buscador + filtros */}
//       <div className="estudiantes-filtros">
//         <input
//           type="text"
//           placeholder="Buscar por nombre..."
//           value={busqueda}
//           onChange={(e) => setBusqueda(e.target.value)}
//         />

//         <div className="filtro-niveles">
//           {["Todos", "Cuarto Nivel", "Quinto Nivel"].map((nivel) => (
//             <button
//               key={nivel}
//               className={filtroNivel === nivel ? "activo" : ""}
//               onClick={() => setFiltroNivel(nivel)}
//             >
//               {nivel === "Todos"
//                 ? "Todos"
//                 : nivel === "Cuarto Nivel"
//                 ? "Cuarto"
//                 : "Quinto"}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tarjetas de encargados, se recicla el ccs de estudiantes  */}
//       <div className="estudiantes-grid">
//         {encargadosFiltrados.map((e) => (
//           <div  className="tarjeta-estudiante">
//             <div className="tarjeta-header">
//               <div className="tarjeta-icono">🎓</div>
//               <div>
//                 <h3>{e.nombre}</h3>
//               </div>
//             </div>

//             <div className="tarjeta-detalle">
//               <p>📧 {e.correo}</p>
//               <p>📞 {e.telefono}</p>
//               <p>👨‍👧 {e.encargados} encargado(s)</p>
//             </div>

//             <div className="tarjeta-acciones">
//               <button className="btn-ver">👁 Ver</button>
//               <button className="btn-editar">✏️</button>
//               <button className="btn-eliminar">🗑</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Engarcados;

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

  // 🔹 Cancelar formulario
  const manejarCancelar = () => {
    setModo("lista");
    setEncargadoEditando(null);
  };

  async function handleDelete(id_encargado) {
    const confirmacion = window.confirm(
      "¿Seguro que deseas eliminar este encargado?"
    );
    if (!confirmacion) return;

    const result = await deleteEncargado(id_encargado);

    if (!result.ok) {
      alert(result.error); // aquí sale "No se puede desactivar este encargado..." si tiene estudiantes activos
      return;
    }

    // Opción simple: recargar desde el backend
    await cargarEncargados();

    // Alternativa: actualizar solo en memoria
    // setEncargados(prev => prev.filter(e => e.id_encargado !== id_encargado));
  }

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
                <div className="tarjeta-icono">👨‍👧</div>
                <div>
                  <h3>{e.nombre}</h3>
                </div>
              </div>

              <div className="tarjeta-detalle">
                <p>📧 {e.correo}</p>
                <p>📞 {e.telefono}</p>
                {/* si luego quieres contar estudiantes, aquí se puede agregar un campo extra */}
              </div>
            </div>

            <div className="tarjeta-acciones-vertical">
              <button 
                className="btn-accion btn-ver"
                onClick={() => handleVer(e)}
                title="Ver detalles"
              >
                👁
              </button>
              <button 
                className="btn-accion btn-editar" 
                onClick={() => handleEdit(e)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => handleDelete(e.id_encargado)}
                title="Eliminar"
              >
                🗑
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
    </div>
  );
}

export default Encargados;

