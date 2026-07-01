import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/authService';

export const RequestPasswordResetScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message || 'Revisa tu correo para continuar');
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', color: 'white' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', borderRadius: '16px', background: '#1f2937' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Recuperar contraseña</h2>
        <p style={{ marginBottom: '1.25rem', color: '#cbd5e1' }}>Ingresá tu email y te enviaremos un enlace para restablecerla.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #4b5563', marginBottom: '1rem' }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem', color: '#86efac' }}>{message}</p>}
        {error && <p style={{ marginTop: '1rem', color: '#fca5a5' }}>{error}</p>}
        <div style={{ marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#93c5fd' }}>Volver al login</Link>
        </div>
      </div>
    </div>
  );
};
