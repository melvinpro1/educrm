import React, { useState } from 'react';
import CampoTexto from '../componentes/ui/CampoTexto';
import BotonPrincipal from '../componentes/ui/BotonPrincipal';
import logo from '../recursos/imagenes/logo.jpg';
import { recuperarPassword } from '../api/auth';

function RecuperarPassword({ onVolver }) {
  const [email, setEmail] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!email || !passwordNueva || !confirmarPassword) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    if (passwordNueva !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (passwordNueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    const resultado = await recuperarPassword(email, passwordNueva);
    setCargando(false);

    if (resultado.ok) {
      setExito(resultado.detail || 'Contraseña actualizada correctamente.');
      setTimeout(() => onVolver(), 2000);
    } else {
      setError(resultado.error || 'Error al actualizar la contraseña.');
    }
  };

  return (
    <div className="pagina-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-autenticacion">
          <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
        </div>

        <h1 className="titulo-autenticacion">Recuperar contraseña</h1>
        <p className="subtitulo-autenticacion">Ingrese su correo y su nueva contraseña</p>

        {error && <div className="mensaje-error-login">{error}</div>}
        {exito && (
          <div className="mensaje-error-login" style={{ background: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }}>
            {exito}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="formulario-autenticacion">
          <CampoTexto
            etiqueta="Correo electrónico"
            tipo="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando || !!exito}
          />

          <CampoTexto
            etiqueta="Nueva contraseña"
            tipo="password"
            placeholder="••••••••"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            disabled={cargando || !!exito}
          />

          <CampoTexto
            etiqueta="Confirmar contraseña"
            tipo="password"
            placeholder="••••••••"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            disabled={cargando || !!exito}
          />

          <BotonPrincipal tipo="submit" disabled={cargando || !!exito}>
            {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
          </BotonPrincipal>
        </form>

        <p className="texto-pie-autenticacion">
          <a
            href="#login"
            className="enlace-autenticacion"
            onClick={(e) => { e.preventDefault(); onVolver(); }}
          >
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default RecuperarPassword;
