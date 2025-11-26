# Sistema de Validaciones - EduCRM

## Descripción General
Se ha implementado un sistema completo de validaciones para el formulario de estudiantes con formateo automático y verificación en tiempo real.

## Validaciones Implementadas

### 1. Cédula
- **Formato**: `#-####-####` (9 dígitos totales)
- **Auto-formateo**: El campo automáticamente formatea mientras el usuario escribe
- **Validaciones**:
  - Campo obligatorio
  - Formato correcto (9 dígitos con guiones)
  - Verificación de duplicados en base de datos
  - No se puede cambiar la cédula al editar un estudiante
- **Mensajes de error**:
  - "La cédula es obligatoria"
  - "Formato de cédula inválido (#-####-####)"
  - "Esta cédula ya está registrada"

### 2. Teléfonos (Estudiante y Encargado)
- **Formato**: `####-####` (8 dígitos totales)
- **Auto-formateo**: El campo automáticamente formatea mientras el usuario escribe
- **Validaciones**:
  - Formato correcto (8 dígitos con guión)
- **Mensajes de error**:
  - "Formato de teléfono inválido (####-####)"

### 3. Correos Electrónicos
- **Campos**: Correo Institucional, Correo Personal, Correo del Encargado
- **Validaciones**:
  - Formato válido de email (usando expresión regular)
  - Correo institucional obligatorio
  - Correo del encargado obligatorio
  - Los correos institucional y personal deben ser diferentes
- **Mensajes de error**:
  - "El correo institucional es obligatorio"
  - "El correo del encargado es obligatorio"
  - "Formato de correo inválido"
  - "Los correos deben ser diferentes"

### 4. Datos del Encargado
- **Validaciones**:
  - Nombre del encargado obligatorio
  - Correo del encargado obligatorio
  - No se pueden editar los datos del encargado desde el formulario de estudiante
- **Mensajes de error**:
  - "El nombre del encargado es obligatorio"

## Experiencia de Usuario

### Validación en Tiempo Real
- **onBlur**: Las validaciones se ejecutan cuando el usuario sale del campo
- **onChange**: El formateo se aplica mientras el usuario escribe
- **Visual Feedback**: 
  - Campos con error tienen borde rojo y fondo rosa claro
  - Mensajes de error en rojo debajo del campo
  - Mensaje de "Verificando cédula..." durante la validación asíncrona

### Prevención de Envío
- El botón de guardar se deshabilita cuando:
  - Hay errores de validación pendientes
  - Se está verificando la cédula en la base de datos
- El botón muestra "Validando..." durante verificaciones asíncronas

### Formateo Automático
Los usuarios solo necesitan escribir números:
- Cédula: Usuario escribe "123456789" → Sistema muestra "1-2345-6789"
- Teléfono: Usuario escribe "12345678" → Sistema muestra "1234-5678"

## Archivos Modificados

### 1. `src/utils/validaciones.js` (NUEVO)
Utilidades de validación y formateo:
- `formatCedula(valor)`: Formatea a #-####-####
- `formatTelefono(valor)`: Formatea a ####-####
- `validarCedula(cedula)`: Verifica formato completo
- `validarTelefono(telefono)`: Verifica formato completo
- `validarEmail(email)`: Valida formato de email
- `extraerNumeros(texto)`: Extrae solo dígitos

### 2. `src/api/estudiantes.js`
- Nueva función `verificarCedulaExistente(cedula, idEstudiante)`: Verifica duplicados

### 3. `src/paginas/FormularioEstudiante.jsx`
- Estado `errores`: Objeto que almacena errores por campo
- Estado `validando`: Bandera para validación asíncrona
- Función `manejarCambio`: Actualizada con formateo automático
- Función `validarCampo`: Valida campos individuales
- Función `manejarSubmit`: Validación completa antes de enviar
- JSX actualizado con:
  - Atributos `onBlur` para validación
  - Atributos `placeholder` con formato esperado
  - Clases `input-error` condicionales
  - Mensajes de error dinámicos

### 4. `src/paginas/FormularioEncargado.jsx`
- Estado `errores`: Objeto que almacena errores por campo
- Función `manejarCambio`: Actualizada con formateo automático de teléfono
- Función `validarCampo`: Valida campos individuales (nombre, correo, teléfono)
- Función `manejarSubmit`: Validación completa antes de enviar
- JSX actualizado con:
  - Atributos `onBlur` para validación en tiempo real
  - Atributos `placeholder` con formato esperado
  - Clases `input-error` condicionales
  - Mensajes de error dinámicos
  - Botón deshabilitado cuando hay errores

### 5. `src/recursos/estilos/VistaEstudiante.css`
- Estilos para `.input-error`: Campo con error
- Estilos para `.mensaje-error`: Mensaje de error
- Estilos para `.mensaje-info`: Mensaje informativo
- Estado `:disabled` para botón de guardar

## Flujo de Validación

### 1. Usuario escribe en un campo
```
onChange → manejarCambio() → formatear valor → actualizar estado
```

### 2. Usuario sale del campo
```
onBlur → validarCampo() → verificar reglas → actualizar errores
```

### 3. Usuario envía formulario
```
onSubmit → manejarSubmit() → validar todos los campos → verificar cédula → enviar o mostrar errores
```

## ✅ Validaciones Implementadas en Ambos Formularios

### FormularioEstudiante.jsx
- ✅ Formateo automático de cédula (#-####-####)
- ✅ Formateo automático de teléfono (####-####)
- ✅ Validación de correos (institucional, personal, encargado)
- ✅ Verificación de cédula duplicada
- ✅ Validación de correos diferentes (institucional ≠ personal)
- ✅ Validación en tiempo real con onBlur

### FormularioEncargado.jsx
- ✅ Formateo automático de teléfono (####-####)
- ✅ Validación de correo electrónico
- ✅ Validación de nombre obligatorio
- ✅ Validación en tiempo real con onBlur
- ✅ Botón deshabilitado con errores

## Próximos Pasos Sugeridos

1. **Validaciones en el Backend** (IMPORTANTE para seguridad)
   - Agregar validación en serializers de Django
   - Verificar unicidad de cédula en el modelo
   - Validar formato de teléfono en el backend
   
2. **Mejoras Opcionales**
   - Agregar validación de formato de email institucional (ej: debe terminar en @universidad.edu)
   - Agregar validación de longitud de nombres
   - Agregar validación de direcciones
   - Agregar verificación de correo duplicado para encargados

## Notas Técnicas

- Las validaciones son asíncronas para verificar duplicados sin bloquear la UI
- El formateo usa `extraerNumeros()` para limpiar el valor antes de aplicar el formato
- Los errores se limpian automáticamente cuando el usuario corrige el campo
- La validación de correos diferentes se ejecuta en ambos campos para mantener consistencia
