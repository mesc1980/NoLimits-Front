import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  async function handleUpdate(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const correo = localStorage.getItem("reset_email");

      const response = await fetch(
        "http://localhost:8080/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            correo,
            password,
            }),
        }
    );

    const data = await response.text();

    if (!response.ok) {
        setError(data);
        return;
    }

    setMessage('Contraseña actualizada correctamente.');

    setTimeout(() => {
        navigate('/login');
    }, 1500);
    } catch (err) {
      setError('Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form
        onSubmit={handleUpdate}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px',
          border: '1px solid var(--nl-border)',
          borderRadius: '16px',
          background: 'var(--nl-bg-elevated)',
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>
          Nueva contraseña
        </h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={{
            width: '100%',
            height: '48px',
            marginBottom: '16px',
            padding: '0 12px',
          }}
        />
        <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
                width: '100%',
                height: '48px',
                marginBottom: '16px',
                padding: '0 12px',
        }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '48px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Actualizando...' : 'Guardar contraseña'}
        </button>

        {message && (
          <p style={{ color: '#4ade80', marginTop: '16px' }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: '#ff4d4f', marginTop: '16px' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}