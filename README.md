# EDUCRM - Sistema de Gestión Académica

Sistema CRM para gestión de estudiantes, encargados y comunicaciones del Colegio de Computación San Pedro (CCSP).

## 🚀 Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/melvinpro1/educrm.git
cd educrm
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

#### **Variables del Frontend:**
- `REACT_APP_API_BASE_URL`: URL del backend (dejar `http://localhost:8000/api`)

#### **Variables del Backend:**

**Django Secret Key:**
```bash
# Generar nueva secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copiar el resultado en `SECRET_KEY`

**Base de Datos (SQL Server):**
- `DB_NAME`: Nombre de tu base de datos
- `DB_USER`: Usuario de SQL Server (ej: `sa`)
- `DB_PASSWORD`: Contraseña del usuario
- `DB_HOST`: Servidor (ej: `localhost\SQLEXPRESS` o `TU-PC\SQLEXPRESS`)
- `DB_DRIVER`: Driver ODBC instalado (verificar en "Administrador de orígenes de datos ODBC")

**Email (Gmail SMTP):**
- `EMAIL_HOST_USER`: Tu correo Gmail
- `EMAIL_HOST_PASSWORD`: **App Password** de Gmail (NO tu contraseña normal)

**Cómo obtener App Password de Gmail:**
1. Ir a https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos" (si no está activa)
3. Buscar "Contraseñas de aplicaciones"
4. Generar nueva contraseña para "Correo"
5. Copiar la contraseña de 16 caracteres en `EMAIL_HOST_PASSWORD`

**Verificar Driver ODBC instalado (Windows):**
```bash
# Listar drivers ODBC disponibles
Get-OdbcDriver | Where-Object {$_.Name -like "*SQL Server*"} | Select-Object Name
```
Si no aparece "ODBC Driver 17 for SQL Server", descargarlo desde:
https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

**Obtener nombre del servidor SQL Server:**
```bash
# En SQL Server Management Studio (SSMS), el nombre del servidor aparece al conectar
# Formato: NOMBRE-PC\INSTANCIA (ej: LAPTOP-ABC123\SQLEXPRESS)
```

**Ejemplo de `.env.local` configurado:**
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api

SECRET_KEY=django-insecure-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=mssql
DB_NAME=BackEduCRM
DB_USER=sa
DB_PASSWORD=MiPassword123
DB_HOST=LAPTOP-ABC123\SQLEXPRESS
DB_PORT=
DB_DRIVER=ODBC Driver 17 for SQL Server

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=miproyecto@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```


### 3. Backend (Django)
```bash
# Crear entorno virtual
python -m venv .venv

# Activar entorno (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r backend/edubackend/requirements.txt

# Ejecutar migraciones
cd backend/edubackend
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### 4. Frontend (React)
```bash
# En otra terminal, desde la raíz
npm install
npm start
```

## 🌐 Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Django:** http://localhost:8000/admin

## 📦 Tecnologías

- **Frontend:** React 19.2
- **Backend:** Django 5.2 + Django REST Framework
- **Base de datos:** SQL Server
- **Email:** SMTP Gmail

## 📝 Notas

### Requisitos previos:
- Python 3.11+ 
- Node.js 16+
- SQL Server con ODBC Driver 17 instalado
- Cuenta Gmail con verificación en 2 pasos (para emails)

### Variables de entorno importantes:
- **No subir `.env.local`** al repositorio (ya está en .gitignore)
- Cada desarrollador debe configurar su propio `.env.local`
- Generar nueva `SECRET_KEY` para producción
- Usar **App Password** de Gmail, no la contraseña normal

### Documentación adicional:
- Ver `ENV_CONFIG.md` para configuración detallada
- Ver `COMANDOS.md` para comandos útiles


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
