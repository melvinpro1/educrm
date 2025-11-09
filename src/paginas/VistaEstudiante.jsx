import React, { useState } from "react";
import "../recursos/estilos/VistaEstudiante.css";
import FormularioEstudiante from "./FormularioEstudiante";

// 🔹 Datos de ejemplo. Luego se reemplazan con datos reales del backend.
const datosIniciales = [
  {
    id: 1,
    nombre: "Carlos Alberto Mora Jiménez",
    cedula: "207891234",
    nivel: "Cuarto Nivel",
    estado: "activo",
    correo: "carlos.mora@ccsp.ed.cr",
    telefono: "7654-3210",
    encargados: 0,
  },
  {
    id: 2,
    nombre: "José David Rojas Solano",
    cedula: "109876543",
    nivel: "Quinto Nivel",
    estado: "activo",
    correo: "jose.rojas@ccsp.ed.cr",
    telefono: "6543-2109",
    encargados: 0,
  },
  {
    id: 3,
    nombre: "María Fernanda González Ramírez",
    cedula: "118450623",
    nivel: "Cuarto Nivel",
    estado: "activo",
    correo: "maria.gonzalez@ccsp.ed.cr",
    telefono: "8765-4321",
    encargados: 0,
  },
  {
    id: 4,
    nombre: "Ana Lucía Vargas Castro",
    cedula: "305678912",
    nivel: "Quinto Nivel",
    estado: "activo",
    correo: "ana.vargas@ccsp.ed.cr",
    telefono: "8888-7777",
    encargados: 0,
  },
];

function Estudiantes() {
  const [modo, setModo] = useState("lista"); // "lista" | "nuevo"
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
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.cedula.includes(busqueda)
    );

  const estudiantesFiltrados = filtrarPorBusqueda(
    filtrarPorNivel(estudiantes)
  );

  // 🔹 Cuando se guarda el formulario
  const manejarGuardarEstudiante = (nuevoRegistro) => {
    // Aquí solo lo agregamos a la lista local.
    // Luego esto se cambia por un POST al backend.
    setEstudiantes((prev) => [
      ...prev,
      { id: prev.length + 1, ...nuevoRegistro },
    ]);
    setModo("lista");
  };

  // 🔹 Cuando se cancela el formulario
  const manejarCancelar = () => {
    setModo("lista");
  };

  // Si está en modo formulario: mostramos solo el form
  if (modo === "nuevo") {
    return (
      <div className="estudiantes">
        <div className="estudiantes-header">
          <div>
            <h1>Nuevo Estudiante</h1>
            <p>
              Registre los datos del estudiante y su encargado. Ambos se
              guardarán juntos.
            </p>
          </div>
        </div>

        <FormularioEstudiante
          onGuardar={manejarGuardarEstudiante}
          onCancelar={manejarCancelar}
        />
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

      {/* Tarjetas de estudiantes */}
      <div className="estudiantes-grid">
        {estudiantesFiltrados.map((e) => (
          <div key={e.id} className="tarjeta-estudiante">
            <div className="tarjeta-header">
              <div className="tarjeta-icono">🎓</div>
              <div>
                <h3>{e.nombre}</h3>
                <p className="cedula">{e.cedula}</p>
              </div>
            </div>

            <div className="tarjeta-detalle">
              <span
                className={
                  "nivel " +
                  (e.nivel === "Cuarto Nivel" ? "violeta" : "verde")
                }
              >
                {e.nivel}
              </span>
              <span className="estado">{e.estado}</span>

              <p>📧 {e.correoInstitucional}</p>
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

export default Estudiantes;
