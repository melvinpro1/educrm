import React, { useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";

// 🔹 Datos de ejemplo. Luego se reemplazan con datos reales del backend.
const datosIniciales = [
  {
    nombre: "Sofía Jiménez Rojas",
    correo: "sofia.jimenez@ccsp.ed.cr",
    telefono: "8456-2390",
  },
  {
    nombre: "Andrés Mora Solís",
    correo: "andres.mora@ccsp.ed.cr",
    telefono: "8867-5421",
  },
  {
    nombre: "Luciana Araya Quesada",
    correo: "luciana.araya@ccsp.ed.cr",
    telefono: "7012-4356",
  },
  {
    nombre: "Samuel Vargas Hernández",
    correo: "samuel.vargas@ccsp.ed.cr",
    telefono: "8345-1298",
  },
  {
    nombre: "Mariana Rodríguez Coto",
    correo: "mariana.rodriguez@ccsp.ed.cr",
    telefono: "8721-0043",
  },
  {
    nombre: "Diego Sánchez Porras",
    correo: "diego.sanchez@ccsp.ed.cr",
    telefono: "7298-3311",
  },
  {
    nombre: "Isabella Pérez Chavarría",
    correo: "isabella.perez@ccsp.ed.cr",
    telefono: "8884-2309",
  },
  {
    nombre: "Felipe Campos Aguilar",
    correo: "felipe.campos@ccsp.ed.cr",
    telefono: "7116-9832",
  },
];

//se debe cambiar los datos de ejemplo por datos reales del backend
//se debe cambiar la forma de filtrar ya que esto esta relacionado con los estudiantes y no con los encargados
function Engarcados() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [estudiantes, setEstudiantes] = useState(datosIniciales);

  // 🔹 Filtra por nivel
  const filtrarPorNivel = (lista) => {
    if (filtroNivel === "Todos") return lista;
    return lista.filter((e) => e.nivel === filtroNivel);
  };

  // 🔹 Filtra por nombre o cédula
  const filtrarPorBusqueda = (lista) =>
    lista.filter(
      (e) =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

  const encargadosFiltrados = filtrarPorBusqueda(
    filtrarPorNivel(estudiantes)
  );


  // 🔹 MODO LISTA (vista normal)
  return (
    <div className="estudiantes">
      {/* Encabezado con botón */}
      <div className="estudiantes-header">
        <div>
          <h1>Gestión de Encargados</h1>
          <p>Administre la información de los encargados del CCSP</p>
        </div>

      </div>

      {/* Buscador + filtros */}
      <div className="estudiantes-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="filtro-niveles">
          {["Todos", "Cuarto Nivel", "Quinto Nivel"].map((nivel) => (
            <button
              key={nivel}
              className={filtroNivel === nivel ? "activo" : ""}
              onClick={() => setFiltroNivel(nivel)}
            >
              {nivel === "Todos"
                ? "Todos"
                : nivel === "Cuarto Nivel"
                ? "Cuarto"
                : "Quinto"}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de encargados, se recicla el ccs de estudiantes  */}
      <div className="estudiantes-grid">
        {encargadosFiltrados.map((e) => (
          <div  className="tarjeta-estudiante">
            <div className="tarjeta-header">
              <div className="tarjeta-icono">🎓</div>
              <div>
                <h3>{e.nombre}</h3>
              </div>
            </div>

            <div className="tarjeta-detalle">
              <p>📧 {e.correo}</p>
              <p>📞 {e.telefono}</p>
              <p>👨‍👧 {e.encargados} encargado(s)</p>
            </div>

            <div className="tarjeta-acciones">
              <button className="btn-ver">👁 Ver</button>
              <button className="btn-editar">✏️</button>
              <button className="btn-eliminar">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Engarcados;
