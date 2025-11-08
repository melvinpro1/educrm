import React from 'react';

// Componente reutilizable para campos de texto
function CampoTexto({ etiqueta, tipo = 'text', placeholder, ...rest }) {
  return (
    <div className="grupo-campo">
      {etiqueta && <label className="etiqueta-campo">{etiqueta}</label>}
      <input
        type={tipo}
        placeholder={placeholder}
        className="campo"
        {...rest}
      />
    </div>
  );
}

export default CampoTexto;
