'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage({ text: 'Token de recuperación no encontrado', type: 'error' });
    }
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Contraseña restablecida con éxito. Redireccionando al login...', type: 'success' });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage({ text: data.message || 'Error al restablecer contraseña', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 style={{ marginBottom: '8px' }}>🆕 Nueva Contraseña</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Ingresa tu nueva contraseña para acceder al sistema.
      </p>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Nueva Contraseña</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
            {message.text}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !token}>
          {loading ? 'Restableciendo...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="public-shell" style={{ background: '#f1f5f9' }}>
      <div className="public-container" style={{ maxWidth: '520px' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <Suspense fallback={<div className="card auth-card"><p style={{ margin: 0, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Cargando...</p></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
