import React, { useState } from 'react';
import CampoTexto from '../componentes/ui/CampoTexto';
import BotonPrincipal from '../componentes/ui/BotonPrincipal';
import logo from '../recursos/imagenes/logo.jpg'; // Ajusta la ruta según donde hayas guardado tu imagen
import { login } from '../api/auth';

// Página de inicio de sesión de EduCRM
function Login({ onLoginExitoso, onMostrarRegistro, onMostrarRecuperar }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setPendiente(false);
    setCargando(true);

    if (!correo || !contrasena) {
      setError('Por favor, complete todos los campos');
      setCargando(false);
      return;
    }

    try {
      const resultado = await login(correo, contrasena);

      if (resultado.ok) {
        onLoginExitoso();
      } else if (resultado.pendiente_aprobacion) {
        setPendiente(true);
      } else {
        setError(resultado.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const manejarLoginGoogle = () => {
    console.log('Inicio de sesión con Google (a implementar)');
    setError('Funcionalidad de Google no implementada aún');
  };

  return (
    <div className="pagina-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-autenticacion">
          <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
        </div>

        <h1 className="titulo-autenticacion">Bienvenido a EduCRM</h1>
        <p className="subtitulo-autenticacion">Inicie sesión para continuar</p>

        {pendiente && (
          <div
            style={{
              background: '#fef9c3',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '12px',
              color: '#92400e',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            ⏳ Su cuenta está <strong>pendiente de aprobación</strong> por el administrador. Por favor, espere.
          </div>
        )}

        {error && (
          <div className="mensaje-error-login">
            {error}
          </div>
        )}

        <BotonPrincipal variante="secundario" onClick={manejarLoginGoogle}>
          <span className="icono-google">G</span>
          Continuar con Google
        </BotonPrincipal>

        <div className="separador"><span>O</span></div>

        <form onSubmit={manejarEnvio} className="formulario-autenticacion">
          <CampoTexto
            etiqueta="Correo electrónico o Usuario"
            tipo="text"
            placeholder="usuario@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={cargando}
          />

          <CampoTexto
            etiqueta="Contraseña"
            tipo="password"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={cargando}
          />

          <BotonPrincipal tipo="submit" disabled={cargando}>
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </BotonPrincipal>
        </form>

        <p className="texto-pie-autenticacion">
          ¿Olvidó su contraseña?{' '}
          <a
            href="#recuperar"
            className="enlace-autenticacion"
            onClick={(e) => { e.preventDefault(); onMostrarRecuperar(); }}
          >
            Recupérela aquí
          </a>
        </p>

        <p className="texto-pie-autenticacion">
          ¿No tiene una cuenta?{' '}
          <a
            href="#registro"
            className="enlace-autenticacion"
            onClick={(e) => {
              e.preventDefault();
              onMostrarRegistro();
            }}
          >
            Regístrese aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
