import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

export const ResetPasswordScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.message || 'Contraseña restablecida');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', color: 'white' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', borderRadius: '16px', background: '#1f2937' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Nueva contraseña</h2>
        <p style={{ marginBottom: '1.25rem', color: '#cbd5e1' }}>Ingresá una nueva contraseña para tu cuenta.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #4b5563', marginBottom: '1rem' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #4b5563', marginBottom: '1rem' }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
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
