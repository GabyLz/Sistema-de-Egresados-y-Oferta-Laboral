'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoggedIn, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && userRole) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, userRole, router]);

  return (
    <main className="public-shell" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="public-container">
        <div className="card shadow-lg" style={{ 
            maxWidth: '820px', 
            width: '100%',
            margin: '0 auto',
            textAlign: 'center', 
            padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 44px)',
            borderRadius: '24px',
            border: 'none'
          }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            background: 'rgba(0, 102, 204, 0.1)', 
            borderRadius: '100px',
            color: 'var(--accent)',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginBottom: '24px',
            letterSpacing: '1px'
          }}>
            BIENVENIDO A SEGO
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.1rem, 4.8vw, 3.5rem)', 
            fontWeight: '800',
            color: 'var(--accent)', 
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            Tu Futuro Profesional <br/> 
            <span style={{ color: '#1e293b' }}>Empieza Aquí</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#64748b', 
            marginBottom: '40px', 
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            La plataforma definitiva para la gestión de egresados y vinculación laboral. Conectamos el mejor talento académico con las empresas líderes del mercado.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/login" className="btn btn-primary" style={{ 
              padding: '16px 40px', 
              fontSize: '1.1rem',
              borderRadius: '12px',
              fontWeight: '600',
              boxShadow: '0 10px 15px -3px rgba(0, 102, 204, 0.3)'
            }}>
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-secondary" style={{ 
              padding: '16px 40px', 
              fontSize: '1.1rem',
              borderRadius: '12px',
              fontWeight: '600',
              background: 'white',
              border: '2px solid #e2e8f0',
              color: '#1e293b'
            }}>
              Crear Cuenta
            </Link>
          </div>
          
          <div className="public-stats">
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px' }}>👨‍🎓 Egresados</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Registro, perfil profesional y seguimiento.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px' }}>🏢 Empresas</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Publicación de ofertas y reclutamiento.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px' }}>💼 Ofertas</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Postulación y gestión de candidatos.</p>
            </div>
          </div>
      </div>
      </div>
    </main>
  );
}
