import React from 'react';

// Botón principal reutilizable
function BotonPrincipal({ children, onClick, variante = 'principal', tipo = 'button' }) {
  return (
    <button
      type={tipo}
      onClick={onClick}
      className={`boton ${variante === 'secundario' ? 'boton-secundario' : 'boton-principal'}`}
    >
      {children}
    </button>
  );
}

export default BotonPrincipal;
