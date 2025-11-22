import React, { useState } from 'react';
import CampoTexto from '../componentes/ui/CampoTexto';
import BotonPrincipal from '../componentes/ui/BotonPrincipal';
import logo from '../recursos/imagenes/logo.jpg'; // Ajusta la ruta según donde hayas guardado tu imagen

// Página de inicio de sesión de EduCRM
function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const manejarEnvio = (e) => {
    e.preventDefault();
    console.log('Intento de inicio de sesión:', { correo, contrasena });
  };

  const manejarLoginGoogle = () => {
    console.log('Inicio de sesión con Google (a implementar)');
  };

  return (
    <div className="pagina-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-autenticacion">
          <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
        </div>

        <h1 className="titulo-autenticacion">Bienvenido a EduCRM</h1>
        <p className="subtitulo-autenticacion">Inicie sesión para continuar</p>

        <BotonPrincipal variante="secundario" onClick={manejarLoginGoogle}>
          <span className="icono-google">G</span>
          Continuar con Google
        </BotonPrincipal>

        <div className="separador"><span>O</span></div>

        <form onSubmit={manejarEnvio} className="formulario-autenticacion">
          <CampoTexto
            etiqueta="Correo electrónico"
            tipo="email"
            placeholder="usuario@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <CampoTexto
            etiqueta="Contraseña"
            tipo="password"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <BotonPrincipal tipo="submit">Iniciar sesión</BotonPrincipal>
        </form>

        <p className="texto-pie-autenticacion">
          ¿No tiene una cuenta? <a href="#registro" className="enlace-autenticacion">Regístrese aquí</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
