import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { uploadEstudiantesCSV } from "../../api/estudiantes";
import './ImportarEstudiantesCSV.css';

const ImportarEstudiantesCSV = ({ onClose, onFinalizar }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [infoPlantilla, setInfoPlantilla] = useState(null);
  const [step, setStep] = useState(1); // 1: Descarga, 2: Carga, 3: Validación

  // Cargar información de la plantilla al montar
  useEffect(() => {
    const cargarInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/estudiantes/info-plantilla/`);
        const data = await response.json();
        setInfoPlantilla(data);
      } catch (err) {
        console.error("Error cargando info de plantilla:", err);
      }
    };
    cargarInfo();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);

    // Detectar tipo de archivo
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'xlsx' || fileType === 'xls') {
      // Leer archivo Excel
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'array' });
          // Leer la segunda hoja "Datos" si existe, sino la primera
          const sheetName = workbook.SheetNames.includes('Datos') ? 'Datos' : workbook.SheetNames[1] || workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          const mappedData = data.map((row) => ({
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

          const filteredData = mappedData.filter(d => d.cedula || d.nombre);
          
          if (filteredData.length === 0) {
            setError("No se encontraron registros válidos en el archivo Excel.");
          } else {
            setDatos(filteredData);
            setStep(3);
          }
        } catch (err) {
          setError("Error al leer el archivo Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === 'csv') {
      // Leer archivo CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
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

          const filteredData = mappedData.filter(d => d.cedula || d.nombre);
          
          if (filteredData.length === 0) {
            setError("No se encontraron registros válidos en el CSV.");
          } else {
            setDatos(filteredData);
            setStep(3);
          }
        },
        error: (err) => {
          setError("Error al leer el archivo CSV: " + err.message);
        },
      });
    } else {
      setError("Formato de archivo no soportado. Por favor, usa .csv o .xlsx");
    }
  };

  const descargarPlantilla = async () => {
    try {
      window.location.href = "http://localhost:8000/api/estudiantes/descargar-plantilla/";
    } catch (err) {
      setError("Error al descargar la plantilla: " + err.message);
    }
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

  // STEP 1: Descarga de plantilla
  if (step === 1) {
    return (
      <div className="modal-plantilla">
        <div className="plantilla-contenedor">
          <div className="plantilla-header">
            <h2>📥 Descargar Plantilla</h2>
            <p>Obtén la plantilla con instrucciones y ejemplos</p>
          </div>

          <div className="info-seccion">
            <h3>📋 Información de la Plantilla</h3>
            {infoPlantilla && (
              <div className="info-grid">
                <div className="info-box obligatorio">
                  <strong>Campos Obligatorios ({infoPlantilla.campos_obligatorios?.length})</strong>
                  <ul>
                    {infoPlantilla.campos_obligatorios?.map((campo, idx) => (
                      <li key={idx}>✓ {campo}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-box opcional">
                  <strong>Campos Opcionales ({infoPlantilla.campos_opcionales?.length})</strong>
                  <ul>
                    {infoPlantilla.campos_opcionales?.map((campo, idx) => (
                      <li key={idx}>◇ {campo}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {infoPlantilla?.validaciones && (
            <div className="info-seccion">
              <h3>✔️ Reglas de Validación</h3>
              <div className="validaciones-grid">
                {Object.entries(infoPlantilla.validaciones).map(([campo, regla]) => (
                  <div key={campo} className="validacion-item">
                    <strong>{campo}:</strong>
                    <p>{regla}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="acciones">
            <button onClick={descargarPlantilla} className="btn-descargar">
              Descargar Plantilla Excel
            </button>
            <button onClick={() => setStep(2)} className="btn-continuar">
              Subir Archivo
            </button>
            <button onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Seleccionar archivo
  if (step === 2) {
    return (
      <div className="modal-plantilla">
        <div className="plantilla-contenedor">
          <div className="plantilla-header">
            <h2>📤 Cargar Archivo</h2>
            <p>Selecciona el archivo completado (Excel o CSV)</p>
          </div>

          <div className="carga-area">
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              id="csv-input"
              className="file-input"
            />
            <label htmlFor="csv-input" className="file-label">
              <div className="file-icon">📄</div>
              <p className="file-text">Haz clic o arrastra un archivo aquí</p>
              <p className="file-hint">Formatos: .csv o .xlsx • Máximo 1 archivo</p>
            </label>
          </div>

          {error && (
            <div className="error-mensaje">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          <div className="acciones">
            <button onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Validación y resumen
  if (step === 3 && !resumen) {
    return (
      <div className="modal-plantilla">
        <div className="plantilla-contenedor">
          <div className="plantilla-header">
            <h2>✅ Validación de Datos</h2>
            <p>Se encontraron {datos.length} registros</p>
          </div>

          <div className="validacion-tabla">
            <table>
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Email Institucional</th>
                  <th>Teléfono</th>
                  <th>Grado</th>
                  <th>Colegio</th>
                </tr>
              </thead>
              <tbody>
                {datos.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.cedula}</td>
                    <td>{row.nombre}</td>
                    <td>{row.correo_institucional}</td>
                    <td>{row.telefono}</td>
                    <td>{row.grado}</td>
                    <td>{row.colegio_procedencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datos.length > 10 && (
              <p className="datos-truncados">... y {datos.length - 10} registros más</p>
            )}
          </div>

          {error && (
            <div className="error-mensaje">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          <div className="acciones">
            <button 
              onClick={enviarDatos} 
              disabled={cargando}
              className="btn-enviar"
            >
              {cargando ? "Importando..." : "Importar Estudiantes"}
            </button>
            <button 
              onClick={() => {
                setDatos([]);
                setStep(2);
              }}
              disabled={cargando}
              className="btn-volver"
            >
              Cargar otro archivo
            </button>
            <button onClick={onClose} className="btn-cancelar" disabled={cargando}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: Resultado final
  if (resumen) {
    return (
      <div className="modal-plantilla">
        <div className="plantilla-contenedor">
          <div className="plantilla-header resultado">
            <h2>🎉 Importación Completada</h2>
            <p>Resumen de la operación</p>
          </div>

          <div className="resumen-grid">
            <div className="resumen-card success">
              <div className="resumen-numero">{resumen.creados}</div>
              <div className="resumen-etiqueta">Nuevos Estudiantes</div>
            </div>
            <div className="resumen-card warning">
              <div className="resumen-numero">{resumen.actualizados}</div>
              <div className="resumen-etiqueta">Actualizados</div>
            </div>
            <div className="resumen-card error">
              <div className="resumen-numero">{resumen.errores.length}</div>
              <div className="resumen-etiqueta">Errores</div>
            </div>
          </div>

          {resumen.errores.length > 0 && (
            <div className="errores-seccion">
              <h3>⚠️ Errores Encontrados</h3>
              <ul className="errores-lista">
                {resumen.errores.slice(0, 10).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {resumen.errores.length > 10 && (
                  <li>... y {resumen.errores.length - 10} errores más</li>
                )}
              </ul>
            </div>
          )}

          <div className="acciones">
            <button 
              onClick={() => {
                onFinalizar();
                onClose();
              }}
              className="btn-continuar"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback si no hay step válido
  return null;
};

export default ImportarEstudiantesCSV;
