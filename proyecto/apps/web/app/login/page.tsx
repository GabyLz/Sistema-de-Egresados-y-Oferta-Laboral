'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) setEmail(remembered);
  }, []);

  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setMessage('Completa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token || data.token;
        if (token && data.rol) {
          login(token, data.rol, data.userName || email, data.id || '');
          setMessage('Login exitoso');
          
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          router.replace('/dashboard');
        } else {
          setMessage('Error al obtener datos de sesión');
        }
      } else {
        const text = await response.text();
        let errorMessage = 'Email o contraseña incorrectos';
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch (e) {
          // Si no es JSON, mostrar el texto plano si es breve
          if (text.length < 100) errorMessage = text;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage('Error de conexión: no se pudo conectar con el servidor API (http://localhost:3040)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="public-shell" style={{ background: '#f1f5f9' }}>
      <div className="public-container" style={{ maxWidth: '520px' }}>
        <div className="card shadow-lg auth-card">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '8px' }}>Bienvenido de nuevo</h1>
              <p style={{ color: '#64748b' }}>Accede a tu panel profesional en SEGO</p>
            </div>

            <form onSubmit={submit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  style={{ padding: '12px 16px', borderRadius: '10px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  style={{ padding: '12px 16px', borderRadius: '10px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Recordarme
                </label>
                <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {message && (
                <div
                  className={`alert ${
                    message.includes('exitoso') || message.includes('correcto') ? 'alert-success' : 'alert-error'
                  }`}
                  style={{ marginBottom: '20px', padding: '12px', borderRadius: '10px', fontSize: '0.9rem' }}
                >
                  {message}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" style={{ padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 102, 204, 0.2)' }} disabled={loading}>
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                ¿Aún no tienes una cuenta? <br/>
                <Link href="/register" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>
                  Regístrate ahora mismo
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-features">
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'block' }}>👨‍🎓</span>
              <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>Egresados</strong>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'block' }}>🏢</span>
              <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>Empresas</strong>
            </div>
          </div>
      </div>
    </main>
  );
}
