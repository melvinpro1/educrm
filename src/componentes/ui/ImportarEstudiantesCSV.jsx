import React, { useState } from "react";
import Papa from "papaparse";
import { uploadEstudiantesCSV } from "../../api/estudiantes";

const ImportarEstudiantesCSV = ({ onClose, onFinalizar }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Mapear los nombres de columnas del CSV a los campos esperados por el backend
        const mappedData = results.data.map((row) => ({
          cedula: row.Cedula || row.cedula || row.Cédula || "",
          nombre: row.Nombre || row.nombre || "",
          correo_institucional: row.CorreoInstitucional || row.correo_institucional || "",
          correo_personal: row.CorreoPersonal || row.correo_personal || null,
          telefono: row.Telefono || row.telefono || row.Teléfono || "",
          colegio_procedencia: row.Colegio || row.colegio_procedencia || "",
          grado: row.Grado || row.grado || "",
          direccion_domicilio: row.Direccion || row.direccion_domicilio || "",
          encargado: {
            nombre: row.EncargadoNombre || row.encargado_nombre || "",
            correo: row.EncargadoCorreo || row.encargado_correo || "",
            telefono: row.EncargadoTelefono || row.encargado_telefono || "",
          },
        }));

        // Filtrar filas vacías (que tengan al menos cédula o nombre)
        const filteredData = mappedData.filter(d => d.cedula || d.nombre);
        
        if (filteredData.length === 0) {
            setError("No se encontraron registros válidos en el CSV.");
        } else {
            setDatos(filteredData);
        }
      },
      error: (err) => {
        setError("Error al leer el archivo CSV: " + err.message);
      },
    });
  };

  const descargarPlantilla = () => {
    const headers = [
      "Cedula", "Nombre", "CorreoInstitucional", "CorreoPersonal", "Telefono", 
      "Colegio", "Grado", "Direccion", "EncargadoNombre", "EncargadoCorreo", "EncargadoTelefono"
    ];
    const csvContent = headers.join(",") + "\n" + 
                       "123456789,Juan Perez,juan@progra.com,juan@gmail.com,88887777,Colegio A,Cuarto Nivel,Casa 1,Maria Perez,maria@gmail.com,77776666";
                       
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_estudiantes.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const enviarDatos = async () => {
    if (datos.length === 0) return;
    setCargando(true);
    setError(null);

    const result = await uploadEstudiantesCSV(datos);
    setCargando(false);

    if (result.ok) {
      setResumen(result.data);
      // Solo cerramos automáticamente si fue perfecto
      if (result.data.errores.length === 0) {
        setTimeout(() => {
          onFinalizar();
          onClose();
        }, 2000);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="importar-csv-container">
      {!resumen ? (
        <div className="importar-paso-uno">
          <p className="instrucciones">
            Descargue la plantilla, llénela con la información de los estudiantes y luego súbala aquí. 
            El sistema <strong>actualizará</strong> los existentes por cédula.
          </p>
          
          <div className="importar-acciones-botones">
            <button className="btn-secundario-link" onClick={descargarPlantilla}>
              <span className="bi bi-file-earmark-arrow-down"></span> Descargar Plantilla CSV
            </button>
            
            <div className="upload-wrapper">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  id="csv-input" 
                  style={{ display: 'none' }}
                />
                <label htmlFor="csv-input" className="btn-primario-import">
                  <span className="bi bi-cloud-upload"></span> Seleccionar Archivo CSV
                </label>
            </div>
          </div>

          {error && <div className="alerta-error-csv">{error}</div>}

          {datos.length > 0 && (
            <div className="preview-seccion">
              <h4>Vista Previa ({datos.length} registros)</h4>
              <div className="tabla-scroll">
                <table className="tabla-preview-csv">
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Nombre</th>
                      <th>Grado</th>
                      <th>Encargado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.slice(0, 5).map((d, i) => (
                      <tr key={i}>
                        <td>{d.cedula}</td>
                        <td>{d.nombre}</td>
                        <td>{d.grado}</td>
                        <td>{d.encargado?.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datos.length > 5 && <p className="mas-registros">... y {datos.length - 5} estudiantes más.</p>}
              </div>
              
              <div className="modal-footer-acciones">
                <button className="btn-cancelar" onClick={onClose} disabled={cargando}>Cancelar</button>
                <button className="btn-guardar" onClick={enviarDatos} disabled={cargando}>
                  {cargando ? "Procesando..." : "Iniciar Carga Masiva"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="resumen-final-import">
          <div className="icon-success"><span className="bi bi-check-circle"></span></div>
          <h3>Carga Completada</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{resumen.creados}</span>
              <span className="stat-label">Nuevos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{resumen.actualizados}</span>
              <span className="stat-label">Actualizados</span>
            </div>
          </div>
          
          {resumen.errores.length > 0 && (
            <div className="errores-detalles">
              <h5>Errores detectados ({resumen.errores.length}):</h5>
              <div className="errores-scroll">
                 <ul>
                    {resumen.errores.map((err, i) => <li key={i}>{err}</li>)}
                 </ul>
              </div>
            </div>
          )}
          
          <div className="modal-footer-acciones">
            <button className="btn-guardar" onClick={() => { onFinalizar(); onClose(); }}>Finalizar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportarEstudiantesCSV;
