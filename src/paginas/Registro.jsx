import React, { useState } from 'react';
import CampoTexto from '../componentes/ui/CampoTexto';
import BotonPrincipal from '../componentes/ui/BotonPrincipal';
import logo from '../recursos/imagenes/logo.jpg';
import { register } from '../api/auth';

function Registro({ onRegistroExitoso, onVolverLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmarPassword: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // Validaciones
    if (!formData.username || !formData.email || !formData.password || !formData.confirmarPassword) {
      setError('Por favor, complete todos los campos obligatorios');
      setCargando(false);
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingrese un correo electrónico válido');
      setCargando(false);
      return;
    }

    try {
      const resultado = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      if (resultado.ok) {
        console.log('Registro exitoso:', resultado.data);
        onRegistroExitoso();
      } else {
        setError(resultado.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error en registro:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-autenticacion">
          <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
        </div>

        <h1 className="titulo-autenticacion">Crear Cuenta</h1>
        <p className="subtitulo-autenticacion">Complete el formulario para registrarse</p>

        {error && (
          <div className="mensaje-error-login">
            {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="formulario-autenticacion">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <CampoTexto
              etiqueta="Nombre"
              tipo="text"
              name="first_name"
              placeholder="Juan"
              value={formData.first_name}
              onChange={handleChange}
              disabled={cargando}
            />

            <CampoTexto
              etiqueta="Apellido"
              tipo="text"
              name="last_name"
              placeholder="Pérez"
              value={formData.last_name}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <CampoTexto
            etiqueta="Nombre de Usuario *"
            tipo="text"
            name="username"
            placeholder="usuario123"
            value={formData.username}
            onChange={handleChange}
            disabled={cargando}
          />

          <CampoTexto
            etiqueta="Correo Electrónico *"
            tipo="email"
            name="email"
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            disabled={cargando}
          />

          <CampoTexto
            etiqueta="Contraseña *"
            tipo="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            disabled={cargando}
          />

          <CampoTexto
            etiqueta="Confirmar Contraseña *"
            tipo="password"
            name="confirmarPassword"
            placeholder="Repita la contraseña"
            value={formData.confirmarPassword}
            onChange={handleChange}
            disabled={cargando}
          />

          <BotonPrincipal tipo="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </BotonPrincipal>
        </form>

        <p className="texto-pie-autenticacion">
          ¿Ya tiene una cuenta?{' '}
          <a 
            href="#login" 
            className="enlace-autenticacion"
            onClick={(e) => {
              e.preventDefault();
              onVolverLogin();
            }}
          >
            Inicie sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default Registro;
