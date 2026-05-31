# 🏗️ ARQUITECTURA: SISTEMA DE IMPORTACIÓN CSV PARA ACTIVOS

## 📐 DIAGRAMA DE COMPONENTES

```
┌─────────────────────────────────────────────────────────────────┐
│                      NAVEGADOR - REACT                          │
│                     http://localhost:3000                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  VistaActivos.jsx                                              │
│  ├─ Botón "📥 Importar CSV"                                    │
│  ├─ Estado: modalImportOpen                                    │
│  └─ Import: ImportarActivosCSV                                 │
│                                                                 │
│      │                                                          │
│      └──► ImportarActivosCSV.jsx                               │
│           ├─ PASO 1: Descargar plantilla                       │
│           ├─ PASO 2: Cargar archivo (Excel/CSV)               │
│           ├─ PASO 3: Validar datos                             │
│           └─ PASO 4: Mostrar resultado                         │
│                │                                                │
│                ├──► Lee archivos: XLSX.utils, Papa.parse       │
│                ├──► Mapea columnas (flexible)                  │
│                └──► Llama a API                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ HTTP REST API
           │ /api/activos/*
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND - DJANGO REST                         │
│                  http://localhost:8000                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/api/activos.js                                            │
│  └─ uploadActivosCSV(datos) ─► POST /api/activos/upload-bulk/ │
│                                                                 │
│      ▼ (JSON)                                                   │
│                                                                 │
│  ActivoViewSet (views.py)                                      │
│  ├─ upload_bulk()              [POST]   Crear activos masivo   │
│  ├─ descargar_plantilla()      [GET]    Descargar Excel        │
│  └─ info_plantilla()           [GET]    Info validaciones      │
│       │                                                         │
│       ├──► plantilla_generator.py                              │
│       │    ├─ generar_plantilla_excel()                        │
│       │    ├─ generar_plantilla_csv_mejorada()                 │
│       │    └─ generar_plantilla_info()                         │
│       │                                                         │
│       ├──► Validación de datos                                 │
│       │    ├─ Nombre: 3+ caracteres                            │
│       │    ├─ Tipo: enum válido                                │
│       │    └─ Estado: enum válido                              │
│       │                                                         │
│       └──► BD (Transaction atómica)                            │
│            ├─ CREATE Activo                                    │
│            └─ Retorna resumen                                  │
│                                                                 │
│  Models                                                        │
│  └─ Activo                                                     │
│     ├─ id_activo (PK)                                          │
│     ├─ nombre (CharField)                                      │
│     ├─ tipo (CharField, choices)                               │
│     ├─ estado (CharField, choices)                             │
│     ├─ fecha_creacion (DateTime)                               │
│     └─ fecha_actualizacion (DateTime)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ ORM
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE - SQL SERVER                          │
│                  EduBackCRM (localhost\SQLEXPRESS)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tabla: activos_activo                                         │
│  ├─ id_activo (INT PK)                                         │
│  ├─ nombre (VARCHAR(200))                                      │
│  ├─ tipo (VARCHAR(50))                                         │
│  ├─ estado (VARCHAR(30))                                       │
│  ├─ fecha_creacion (DATETIME)                                  │
│  └─ fecha_actualizacion (DATETIME)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS DETALLADO

### **1. DESCARGA DE PLANTILLA**
```
Frontend                           Backend                        Archivo
   │                                  │                             │
   └─ GET /descargar-plantilla/  ────►│                             │
                                      │                             │
                                      ├─ generar_plantilla_excel()  │
                                      │  • Crea Workbook (openpyxl) │
                                      │  • Hoja 1: Instrucciones    │
                                      │  • Hoja 2: Datos (24 filas) │
                                      │  • Formatos profesionales   │
                                      │                             │
                                      ├─ BytesIO()                  │
                                      │  wb.save(output)            │
                                      │  output.seek(0)             │
                                      │                             │
   ◄─ 200 OK + XLSX bytes  ───────────┤                             │
   │                                                                │
   └─► Descargar archivo: Plantilla_Activos_EduCRM.xlsx          ◄┘
```

### **2. CARGA Y LECTURA DE ARCHIVO**
```
Usuario          Frontend                          Librerías
   │                │                                │
   └─ Selecciona ──►│                                │
     archivo        │                                │
                    ├─ FileReader.readAsArrayBuffer()│
                    │                                │
                    ├─ if .xlsx/.xls ───────────────►│ XLSX
                    │  XLSX.read()                   │ • Parsea binary
                    │  XLSX.utils.sheet_to_json()    │ • Convierte a JSON
                    │                                │
                    ├─ if .csv ─────────────────────►│ PapaParse
                    │  Papa.parse(file)              │ • Parsea CSV
                    │                                │ • Convierte a JSON
                    │                                │
                    ├─ Mapeo flexible
                    │  • Busca variaciones de nombres
                    │  • nombre|Nombre|NOMBRE → nombre
                    │  • tipo|Tipo|TIPO → tipo
                    │  • estado|Estado|ESTADO → estado
                    │
                    └─ setDatos([...])
```

### **3. VALIDACIÓN VISUAL (PREVIEW)**
```
Frontend
   │
   ├─ Renderiza tabla con primeras 15 filas
   │  ┌─────────────────────────────────────┐
   │  │ Nombre  │ Tipo        │ Estado      │
   │  ├─────────────────────────────────────┤
   │  │ Comp... │ computadora │ disponible  │
   │  │ iPad    │ tablet      │ disponible  │
   │  │ Libro   │ libro       │ disponible  │
   │  └─────────────────────────────────────┘
   │
   └─ Usuario revisa y clic "Importar Activos"
```

### **4. IMPORTACIÓN EN BACKEND**
```
Frontend                          Backend                      BD
   │                                 │                          │
   └─ POST /upload-bulk/         ───►│                          │
     [                                │                          │
       {nombre: "...", tipo: "...", estado: "..."},
       {...},
       ...
     ]                                │                          │
                                      │                          │
                                      ├─ transaction.atomic()    │
                                      │  (comienza transacción)  │
                                      │                          │
                                      ├─ for item in data:       │
                                      │  ├─ Validar nombre       │
                                      │  ├─ Validar tipo         │
                                      │  ├─ Validar estado       │
                                      │  │                       │
                                      │  └─ if válido:           │
                                      │     Activo.objects.create()
                                      │                          ├─ INSERT
                                      │                          │
                                      ├─ transaction.commit() ◄─┤
                                      │                          │
   ◄─ 200 OK + Resumen  ──────────────┤                          │
     {
       "success": true,
       "creados": 15,
       "errores": [...],
       "total_procesados": 15
     }
```

### **5. RESULTADO Y RECARGA**
```
Frontend
   │
   ├─ Muestra resumen
   │  • Creados: 15
   │  • Errores: 0
   │
   ├─ Cierra modal automáticamente (si sin errores)
   │
   └─ cargarActivos()
      ├─ GET /api/activos/
      └─ Actualiza lista en pantalla
         └─ Usuario ve los 15 nuevos activos
```

---

## 📦 ESTRUCTURA DE RESPUESTAS

### **Éxito (200 OK)**
```json
{
  "success": true,
  "creados": 42,
  "errores": [],
  "total_procesados": 42
}
```

### **Parcial (207 MULTI_STATUS)**
```json
{
  "success": true,
  "creados": 40,
  "errores": [
    "Fila 3: El nombre es requerido (mínimo 3 caracteres).",
    "Fila 7: Tipo inválido 'monitor'. Debe ser: computadora, tablet, libro, proyector, otro",
    "Fila 15: Estado inválido 'roto'. Debe ser: disponible, prestado, en_mantenimiento"
  ],
  "total_procesados": 40
}
```

### **Error (400 BAD REQUEST)**
```json
{
  "error": "Se esperaba una lista de objetos activo."
}
```

---

## 🔐 CICLO DE VALIDACIÓN

```
┌─────────────────────────────────────────┐
│   Usuario completa Excel con 25 activos │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   Frontend: Lectura de archivo          │
│   • Parsea XLSX/CSV                     │
│   • Mapea columnas flexibles            │
│   • Filtra filas vacías                 │
│   Resultado: 24 filas válidas           │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   Frontend: Preview visual              │
│   • Muestra primeras 15 filas           │
│   • Usuario revisa datos                │
│   • Usuario clic "Importar Activos"     │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   Backend: Validación por fila          │
│   ├─ Fila 1: nombre ✓, tipo ✓, estado ✓│
│   ├─ Fila 2: nombre ✓, tipo ✓, estado ✓│
│   ├─ ...                                │
│   ├─ Fila 18: nombre ✗ (vacío)         │
│   ├─ ...                                │
│   └─ Fila 24: tipo ✗ (inválido)         │
│   Resultado: 22 creados, 2 errores      │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   Frontend: Mostrar resultado           │
│   • Creados: 22 ✓                       │
│   • Errores: 2 ⚠                        │
│   • Listar errores específicos          │
│   • Recarga lista de activos            │
└─────────────────────────────────────────┘
```

---

## 🎯 MAPEO FLEXIBLE DE COLUMNAS

```
Excel Original          Mapeo Frontend       Resultado Final
┌──────────────┐        ┌──────────┐        ┌──────────────┐
│ Nombre       │   ┐    │ nombre   │   ┐    │ nombre       │
│ Tipo         │   ├──►│ tipo     │   ├──►│ tipo         │
│ Estado       │   ┘    │ estado   │   ┘    │ estado       │
└──────────────┘        └──────────┘        └──────────────┘

Variaciones Soportadas:
• Nombre, NOMBRE, nombre, NombrE → nombre
• Tipo, TIPO, tipo, TipO → tipo
• Estado, ESTADO, estado, EstadO → estado
```

---

## 📊 COMPARATIVA: ESTUDIANTES vs ACTIVOS

| Característica | Estudiantes | Activos |
|---|---|---|
| **Endpoint upload-bulk** | ✅ POST | ✅ POST |
| **Plantilla Excel** | ✅ 2 hojas | ✅ 2 hojas |
| **Campos obligatorios** | 6 | 3 |
| **Relaciones anidadas** | ✅ Encargado | ❌ Ninguna |
| **Crear/Actualizar** | ✅ Ambas | ❌ Solo crear |
| **Transacciones atómicas** | ✅ Sí | ✅ Sí |
| **Errors por fila** | ✅ Sí | ✅ Sí |
| **Preview visual** | ✅ Tabla HTML | ✅ Tabla HTML |

---

**Arquitectura completada el 31 de mayo de 2026** ✨
