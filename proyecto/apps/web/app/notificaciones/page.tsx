'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificacionesPage() {
  const { isLoggedIn, userName, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/notificaciones/${userName}`);
        if (res.ok) setNotifications(await res.json());
      } catch (e) {
        console.error('Error fetching notifications:', e);
      } finally {
        setLoading(false);
      }
    };
    if (userName) fetchNotifications();
  }, [userName]);

  const [emailPrefs, setEmailPrefs] = useState({ ofertas: true, postulaciones: true, mensajes: true, recordatorios: true });
  const [channels, setChannels] = useState({ email: true, web: true });
  const [frequency, setFrequency] = useState('diario');

  const handleMarkRead = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${baseUrl}/notificaciones/${id}/leer`, { method: 'PATCH' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };
  const handleDelete = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/notificaciones/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications((current) => current.filter((n) => n.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePrefs = () => {
    alert('Preferencias de notificación actualizadas correctamente');
  };

  return (
    <main className="page-shell">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>🔔 Centro de Notificaciones</h1>
            <p>Gestiona tus alertas y preferencias de comunicación</p>
          </div>
          <button className="btn btn-secondary btn-small" onClick={() => setNotifications([])}>Marcar todas como leídas</button>
        </div>

        <div className="grid-2">
          <section>
            <h2 style={{ marginBottom: '16px' }}>Recientes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px' }}>Tipo</th>
                      <th style={{ padding: '8px' }}>Canal</th>
                      <th style={{ padding: '8px' }}>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px' }}>Nueva oferta</td>
                      <td style={{ padding: '8px' }}>Email/Web</td>
                      <td style={{ padding: '8px' }}>Cuando se publica oferta relevante</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px' }}>Actualización postulación</td>
                      <td style={{ padding: '8px' }}>Email/Web</td>
                      <td style={{ padding: '8px' }}>Cambio de estado en postulación</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px' }}>Nuevo postulante</td>
                      <td style={{ padding: '8px' }}>Email/Web</td>
                      <td style={{ padding: '8px' }}>Cuando alguien postula a tu oferta</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px' }}>Fechas de cierre próximas</td>
                      <td style={{ padding: '8px' }}>Email</td>
                      <td style={{ padding: '8px' }}>Fechas de cierre próximas</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {loading ? (
                <div className="card" style={{ textAlign: 'center' }}>Cargando...</div>
              ) : notifications.length > 0 ? (
                notifications.map((item, idx) => (
                  <article key={idx} className="card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.titulo || 'Actualización'}</h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.tipo || 'Sistema'}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{item.contenido}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{new Date(item.createdAt || Date.now()).toLocaleString()}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-small" style={{ fontSize: '0.7rem' }} onClick={() => handleMarkRead(item.id)}>Leída</button>
                        <button className="btn btn-danger btn-small" style={{ fontSize: '0.7rem' }} onClick={() => handleDelete(item.id)}>Quitar</button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ color: 'var(--text-light)' }}>No tienes notificaciones pendientes.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 style={{ marginBottom: '16px' }}>Preferencias de Notificaciones</h2>
            <div className="card">
              <h3>Canales deseados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={channels.email} onChange={(e) => setChannels({...channels, email: e.target.checked})} />
                  <span>Correo electrónico</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={channels.web} onChange={(e) => setChannels({...channels, web: e.target.checked})} />
                  <span>Notificaciones en web</span>
                </label>
              </div>

              <h3>Frecuencia de resúmenes</h3>
              <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                <select className="form-control" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="instantaneo">Instantáneo</option>
                  <option value="diario">Resumen diario</option>
                  <option value="semanal">Resumen semanal</option>
                </select>
              </div>

              <h3>Eventos a notificar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={emailPrefs.ofertas} onChange={(e) => setEmailPrefs({...emailPrefs, ofertas: e.target.checked})} />
                  <span>Nueva oferta: cuando se publica oferta relevante</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={emailPrefs.postulaciones} onChange={(e) => setEmailPrefs({...emailPrefs, postulaciones: e.target.checked})} />
                  <span>Actualización postulación: cambio de estado en postulación</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={emailPrefs.mensajes} onChange={(e) => setEmailPrefs({...emailPrefs, mensajes: e.target.checked})} />
                  <span>Nuevo postulante: cuando alguien postula a tu oferta</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={emailPrefs.recordatorios} onChange={(e) => setEmailPrefs({...emailPrefs, recordatorios: e.target.checked})} />
                  <span>Fechas de cierre próximas</span>
                </label>
                <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={handleSavePrefs}>Guardar Preferencias</button>
              </div>
            </div>
          </section>
        </div>
    </main>
  );
}
