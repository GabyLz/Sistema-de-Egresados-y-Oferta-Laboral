'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
      } else {
        setMessage({ text: data.message || 'Error al procesar solicitud', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="public-shell" style={{ background: '#f1f5f9' }}>
      <div className="public-container" style={{ maxWidth: '520px' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div className="card auth-card">
            <h1 style={{ marginBottom: '8px' }}>🔑 Recuperar Contraseña</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={submit}>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu.email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {message && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.9rem' }}>
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
