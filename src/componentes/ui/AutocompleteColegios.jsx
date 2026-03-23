import React, { useState, useRef, useEffect } from "react";
import colegios from "../../data/colegiosData.js";

function AutocompleteColegios({ valor, onChange }) {
  const [inputValue, setInputValue] = useState(valor || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [indexSeleccionado, setIndexSeleccionado] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Verificar que los colegios se cargaron correctamente
  useEffect(() => {
    if (colegios && colegios.length > 0) {
      console.log(`✅ Autocomplete: ${colegios.length} colegios cargados`);
    } else {
      console.error("❌ Error: No se cargaron los colegios");
    }
  }, []);

  // Normalizar texto eliminando acentos para búsqueda
  const normalizarTexto = (texto) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Filtrar colegios según el input
  useEffect(() => {
    const textoNormalizado = inputValue.trim();

    if (textoNormalizado.length === 0) {
      // Si está vacío, mostrar TODOS los colegios como sugerencias (para que vea opciones)
      setSugerencias(colegios);
      return;
    }

    const textoNorm = normalizarTexto(textoNormalizado);
    const filtrados = colegios.filter((colegio) =>
      normalizarTexto(colegio).includes(textoNorm)
    );

    setSugerencias(filtrados);
    setIndexSeleccionado(-1);
    
    // Log para debugging
    if (filtrados.length > 0) {
      console.log(`🔍 Encontrados ${filtrados.length} colegio(s) para: "${inputValue}"`);
    }
  }, [inputValue]);

  // Actualizar inputValue cuando el valor prop cambia (caso de edición)
  useEffect(() => {
    if (valor && valor !== inputValue) {
      setInputValue(valor);
    }
  }, [valor]);

  // Cerrar dropdown si se hace clic fuera
  useEffect(() => {
    function manejarClickFuera(e) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setMostrarDropdown(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const manejarSeleccionar = (colegioSeleccionado) => {
    setInputValue(colegioSeleccionado);
    onChange(colegioSeleccionado);
    setMostrarDropdown(false);
    setSugerencias([]);
  };

  const manejarInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value); // Notificar al padre en tiempo real
  };

  const manejarKeyDown = (e) => {
    if (!mostrarDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndexSeleccionado((prev) =>
          prev < sugerencias.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndexSeleccionado((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (indexSeleccionado >= 0) {
          manejarSeleccionar(sugerencias[indexSeleccionado]);
        }
        break;
      case "Escape":
        setMostrarDropdown(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={manejarInputChange}
        onFocus={() => {
          // Mostrar dropdown siempre que el campo esté en foco
          if (sugerencias.length > 0) {
            setMostrarDropdown(true);
            console.log(`📋 Mostrando ${sugerencias.length} opciones`);
          }
        }}
        onKeyDown={manejarKeyDown}
        placeholder="Escribe para buscar un colegio..."
        className="autocomplete-input"
      />

      {mostrarDropdown && sugerencias.length > 0 && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          {sugerencias.map((colegio, index) => (
            <div
              key={index}
              className={`autocomplete-item ${
                index === indexSeleccionado ? "activo" : ""
              }`}
              onClick={() => manejarSeleccionar(colegio)}
              onMouseEnter={() => setIndexSeleccionado(index)}
            >
              <span className="bi bi-school"></span>
              <span>{colegio}</span>
            </div>
          ))}
        </div>
      )}

      {mostrarDropdown &&
        inputValue.trim().length > 0 &&
        sugerencias.length === 0 && (
          <div className="autocomplete-dropdown">
            <div className="autocomplete-no-resultados">
              No se encontraron colegios
            </div>
          </div>
        )}
    </div>
  );
}

export default AutocompleteColegios;
