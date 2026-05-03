'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AyudaPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('faq');
  const [reportForm, setReportForm] = useState({ problema: '', capturas: null });

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  const faqs = [
    {
      q: '¿Olvidé mi contraseña?',
      a: 'Usar la opción "Recuperar contraseña" en la pantalla de inicio. Recibirás un enlace para restablecerla.'
    },
    {
      q: '¿Cómo actualizo mi CV?',
      a: 'Ingresa a "Mi Perfil" → "Documentos" → Subir nuevo archivo CV. El sistema actualizará automáticamente.'
    },
    {
      q: '¿Por qué no veo todas las ofertas?',
      a: 'Las ofertas pueden estar filtradas por ubicación, modalidad o habilidades. Revisa los filtros activos en la sección de búsqueda.'
    },
    {
      q: '¿Cómo elimino mi cuenta?',
      a: 'Contacta al soporte técnico o al administrador del sistema. La eliminación es definitiva y perderás toda la información.'
    }
  ];

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Reporte enviado correctamente. El equipo de soporte técnico revisará su caso pronto.');
    setReportForm({ problema: '', capturas: null });
  };

  return (
    <main className="page-shell">
      <div className="page-header">
          <h1>❓ Centro de Ayuda y Soporte</h1>
          <p>Encuentra respuestas a tus dudas y contacta con nuestro equipo técnico</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '8px' }}>
            <button 
              onClick={() => setActiveTab('faq')}
              style={{ 
                flex: 1, padding: '12px 20px', border: 'none', borderRadius: '8px',
                background: activeTab === 'faq' ? 'white' : 'transparent', 
                color: activeTab === 'faq' ? 'var(--accent)' : '#64748b',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeTab === 'faq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📖 Preguntas Frecuentes
            </button>
            <button 
              onClick={() => setActiveTab('tutoriales')}
              style={{ 
                flex: 1, padding: '12px 20px', border: 'none', borderRadius: '8px',
                background: activeTab === 'tutoriales' ? 'white' : 'transparent', 
                color: activeTab === 'tutoriales' ? 'var(--accent)' : '#64748b',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeTab === 'tutoriales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎥 Guías y Tutoriales
            </button>
            <button 
              onClick={() => setActiveTab('contacto')}
              style={{ 
                flex: 1, padding: '12px 20px', border: 'none', borderRadius: '8px',
                background: activeTab === 'contacto' ? 'white' : 'transparent', 
                color: activeTab === 'contacto' ? 'var(--accent)' : '#64748b',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeTab === 'contacto' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎧 Soporte Directo
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {activeTab === 'faq' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {faqs.map((faq, i) => (
                  <details key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <summary style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {faq.q}
                      <span style={{ color: 'var(--accent)' }}>↓</span>
                    </summary>
                    <p style={{ color: '#475569', marginTop: '12px', lineHeight: '1.6', fontSize: '0.95rem', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            )}

            {activeTab === 'tutoriales' && (
              <div className="grid-2">
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ color: '#1d4ed8', fontSize: '1.1rem', marginBottom: '16px' }}>🎥 Centro de Aprendizaje</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Dominando tu Perfil Profesional', 'Cómo atraer al mejor talento', 'Gestionando postulaciones'].map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>▶</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ color: '#15803d', fontSize: '1.1rem', marginBottom: '16px' }}>📖 Documentación PDF</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Manual del Administrador', 'Guía de Egresados', 'Políticas de Privacidad'].map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', background: '#22c55e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📄</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacto' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#0f172a' }}>Canales de Atención</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📧</div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Correo Electrónico</p>
                        <p style={{ fontWeight: '600', margin: 0 }}>soporte@segosystem.edu.pe</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Línea Directa</p>
                        <p style={{ fontWeight: '600', margin: 0 }}>(01) 456-7890 - Anexo 123</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕒</div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Horario de Atención</p>
                        <p style={{ fontWeight: '600', margin: 0 }}>Lun - Vie: 8:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#0f172a' }}>Enviar un Ticket</h3>
                  <form onSubmit={handleReportIssue}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Categoría del Problema</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option>Error en la plataforma</option>
                        <option>Duda sobre perfil</option>
                        <option>Problema con empresa</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Descripción</label>
                      <textarea 
                        rows={4} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        placeholder="Explícanos brevemente qué sucede..."
                        value={reportForm.problema}
                        onChange={(e) => setReportForm({...reportForm, problema: e.target.value})}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>🚀 Enviar Solicitud</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
