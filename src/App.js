import React from "react";
import Sidebar from "./componentes/siderbar/Siderbar.jsx";
import Home from "./paginas/Home";
import "./index.css"; // si aquí tienes estilos globales

function App() {
  return (
    <div className="layout-principal">
      <Sidebar />
      <main className="contenido-principal">
        <Home />
      </main>
    </div>
  );
}

export default App;
