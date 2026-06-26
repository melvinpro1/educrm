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
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

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
        setRegistroExitoso(true);
      } else {
        setError(resultado.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  if (registroExitoso) {
    return (
      <div className="pagina-autenticacion">
        <div className="tarjeta-autenticacion" style={{ textAlign: 'center' }}>
          <div className="logo-autenticacion">
            <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
          </div>

          <div style={{ fontSize: '56px', margin: '8px 0' }}>✅</div>
          <h1 className="titulo-autenticacion">Registro exitoso</h1>
          <p className="subtitulo-autenticacion" style={{ marginBottom: '16px' }}>
            Su solicitud fue enviada correctamente.
          </p>

          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
            }}
          >
            <p style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
              ¿Qué sigue?
            </p>
            <ul style={{ paddingLeft: '18px', color: '#374151', lineHeight: '1.8', margin: 0 }}>
              <li>El administrador revisará su información.</li>
              <li>Se le asignará un rol según su perfil.</li>
              <li>Una vez aprobado, podrá iniciar sesión.</li>
            </ul>
          </div>

          <BotonPrincipal onClick={onVolverLogin}>
            Ir a iniciar sesión
          </BotonPrincipal>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-autenticacion">
          <img src={logo} alt="Logo de la aplicación" className="imagen-logo" />
        </div>

        <h1 className="titulo-autenticacion">Crear Cuenta</h1>
        <p className="subtitulo-autenticacion">Complete el formulario para registrarse</p>

        <div
          style={{
            background: '#fef9c3',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#92400e',
          }}
        >
          Su registro quedará pendiente de aprobación por el administrador.
        </div>

        {error && <div className="mensaje-error-login">{error}</div>}

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
            onClick={(e) => { e.preventDefault(); onVolverLogin(); }}
          >
            Inicie sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default Registro;
