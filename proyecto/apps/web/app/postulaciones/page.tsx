'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Postulacion {
  id: string;
  egresadoNombre: string;
  ofertaTitulo: string;
  fecha: string;
  estado: 'postulado' | 'en_revision' | 'entrevista' | 'contratado' | 'rechazado';
}

export default function PostulacionesPage() {
  const { isLoggedIn, userRole, userId, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
  };

  const getStatusBadge = (estado: string) => {
    if (!estado) return <span className="badge badge-secondary">❓ Pendiente</span>;
    const statusMap: any = {
      'postulado': { icon: '📝', label: 'Postulado', class: 'badge-primary' },
      'en_revision': { icon: '🔍', label: 'En revisión', class: 'badge-warning' },
      'entrevista': { icon: '🎯', label: 'Entrevista', class: 'badge-info' },
      'contratado': { icon: '✅', label: 'Contratado', class: 'badge-success', style: { border: '2px solid #10b981', fontWeight: '800' } },
      'rechazado': { icon: '❌', label: 'Rechazado', class: 'badge-error' },
    };
    const status = statusMap[estado.toLowerCase()] || { icon: '❓', label: estado, class: 'badge-secondary' };
    return (
      <span 
        className={`badge ${status.class}`} 
        style={{ color: '#0f172a', ...(status.style || {}) }}
      >
        {status.icon} {status.label}
      </span>
    );
  };

  const getProgressByStatus = (estado: string) => {
    const normalized = (estado || '').toLowerCase();

    if (normalized === 'rechazado') {
      return { value: 100, tone: '#dc2626', label: '0 %' };
    }

    if (normalized === 'contratado') {
      return { value: 100, tone: '#16a34a', label: '100 %' };
    }

    if (normalized === 'entrevista') {
      return { value: 60, tone: '#0ea5e9', label: '60 %' };
    }

    if (normalized === 'en_revision' || normalized === 'en revisión' || normalized === 'revision' || normalized === 'revisión') {
      return { value: 40, tone: '#f59e0b', label: '40 %' };
    }

    if (normalized === 'postulado') {
      return { value: 20, tone: '#64748b', label: '20 %' };
    }

    return { value: 8, tone: '#94a3b8', label: '0 %' };
  };

  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPostulaciones = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const endpoint = userRole === 'empresa' ? '/postulaciones/empresa' : '/postulaciones/egresado';
      const response = await fetch(`${baseUrl}${endpoint}/${userId}`);
      if (response.ok) {
        setPostulaciones(await response.json());
      }
    } catch (error) {
      console.error('Error fetching postulaciones:', error);
    }
  };

  useEffect(() => {
    if (userRole && userId) fetchPostulaciones();
  }, [userRole, userId]);

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/postulaciones/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (response.ok) {
        setSuccess('Estado actualizado correctamente');
        setTimeout(() => setSuccess(null), 3000);
        fetchPostulaciones();
      }
    } catch (error) {
      setError('Error al actualizar estado');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <main className="page-shell">
      <div className="page-header">
          <h1>
            {userRole === 'empresa' ? '👥 Gestión de Postulantes' : '📬 Mis Postulaciones'}
          </h1>
          <p>
            {userRole === 'empresa' 
              ? 'Revisa y gestiona los candidatos de tus ofertas laborales' 
              : 'Seguimiento de tus aplicaciones y estados de selección'}
          </p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '24px', padding: '16px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#155724', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '24px', padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>❌ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#721c24', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{userRole === 'empresa' ? 'Postulante' : 'Oferta'}</th>
                  <th>{userRole === 'empresa' ? 'Oferta' : 'Empresa'}</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                  {postulaciones.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)' }}>
                        No hay postulaciones registradas
                      </td>
                    </tr>
                  ) : (
                    postulaciones.map((p: any) => (
                      <tr key={p.id}>
                        <td>{userRole === 'empresa' ? `${p.egresado?.nombres} ${p.egresado?.apellidos}` : p.oferta?.titulo}</td>
                        <td>{userRole === 'empresa' ? p.oferta?.titulo : p.oferta?.empresa?.razonSocial}</td>
                        <td>{formatDate(p.createdAt || p.fechaPostulacion)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '170px' }}>
                            {getStatusBadge(p.estado)}
                            {userRole !== 'empresa' && (
                              (() => {
                                const progress = getProgressByStatus(p.estado);
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>
                                      <span>Match</span>
                                      <span style={{ color: p.estado?.toLowerCase() === 'rechazado' ? '#dc2626' : '#0f172a' }}>{progress.label}</span>
                                    </div>
                                    <div className="progress-track" style={{ height: '8px', background: '#e2e8f0' }}>
                                      <div
                                        className="progress-fill"
                                        style={{ width: `${progress.value}%`, background: progress.tone, minWidth: '8px' }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-secondary btn-small" onClick={() => { setSelectedPostulacion(p); setShowModal(true); }}>Ver</button>
                            {userRole === 'empresa' && p.estado === 'postulado' && (
                              <>
                                <button className="btn btn-primary btn-small" onClick={() => handleUpdateEstado(p.id, 'en_revision')}>Revisar</button>
                                <button className="btn btn-danger btn-small" onClick={() => handleUpdateEstado(p.id, 'rechazado')}>Rechazar</button>
                              </>
                            )}
                            {userRole === 'empresa' && p.estado === 'en_revision' && (
                              <button className="btn btn-success btn-small" onClick={() => handleUpdateEstado(p.id, 'entrevista')}>Citar Entrevista</button>
                            )}
                            {userRole === 'empresa' && p.estado === 'entrevista' && (
                              <button className="btn btn-success btn-small" onClick={() => handleUpdateEstado(p.id, 'contratado')}>Contratar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </table>
          </div>
        </div>

        {showModal && selectedPostulacion && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '700px', width: '100%', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>
                  {userRole === 'empresa' ? 'Perfil del Candidato' : 'Detalle de la Oferta'}
                </h2>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-small">Cerrar</button>
              </div>
              
              <div style={{ padding: '24px 0' }}>
                {userRole === 'empresa' ? (
                  <section>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Nombre Completo</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.egresado?.nombres} {selectedPostulacion.egresado?.apellidos}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>DNI</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.egresado?.dni || 'No registrado'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Carrera Profesional</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.egresado?.carrera || 'No especificada'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Año de Egreso</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.egresado?.anioEgreso || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Correo de Contacto</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.egresado?.user?.email || 'No disponible'}</p>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>Habilidades</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedPostulacion.egresado?.egresadoHabilidades?.length > 0 ? (
                          selectedPostulacion.egresado.egresadoHabilidades.map((h: any, i: number) => (
                            <span key={i} className="user-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                              {h.habilidad?.nombre}
                            </span>
                          ))
                        ) : (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sin habilidades registradas.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>Estado de la Postulación</p>
                      {getStatusBadge(selectedPostulacion.estado)}
                    </div>

                    {selectedPostulacion.comentario && (
                      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--secondary)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Último Comentario de la Empresa</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedPostulacion.comentario}</p>
                      </div>
                    )}

                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Todos los Comentarios</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedPostulacion.historial && selectedPostulacion.historial.length > 0 ? (
                          selectedPostulacion.historial.map((h: any, i: number) => (
                            <div key={h.id || i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid var(--accent)', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold' }}>{h.estadoAnterior ? `${h.estadoAnterior} → ${h.estadoNuevo}` : h.estadoNuevo}</span>
                                <span style={{ color: '#888' }}>{formatDate(h.fechaCambio)}</span>
                              </div>
                              <p style={{ margin: 0, color: '#666' }}>{h.motivo || 'Sin comentario.'}</p>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem', color: '#666' }}>
                            No hay comentarios registrados.
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                ) : (
                  <section>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '8px', color: 'var(--accent)' }}>{selectedPostulacion.oferta?.titulo}</h3>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{selectedPostulacion.oferta?.empresa?.razonSocial}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📍 {selectedPostulacion.oferta?.ubicacion} | {selectedPostulacion.oferta?.tipo}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Rango Salarial</p>
                        <p style={{ fontWeight: '600', color: 'var(--success)' }}>
                          {selectedPostulacion.oferta?.salarioMin ? `$${selectedPostulacion.oferta.salarioMin.toLocaleString()} - $${selectedPostulacion.oferta.salarioMax.toLocaleString()}` : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>Fecha de Cierre</p>
                        <p style={{ fontWeight: '600' }}>{selectedPostulacion.oferta?.fechaCierre ? formatDate(selectedPostulacion.oferta.fechaCierre) : 'Abierta'}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>Descripción del Puesto</p>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                        {selectedPostulacion.oferta?.descripcion || 'Sin descripción detallada.'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>Mi Estado</p>
                      {getStatusBadge(selectedPostulacion.estado)}
                    </div>

                    {selectedPostulacion.comentario && (
                      <div style={{ marginTop: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
                        <p style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px', fontWeight: 'bold' }}>💬 Comentario de la Empresa:</p>
                        <p style={{ margin: 0, color: '#0c4a6e' }}>{selectedPostulacion.comentario}</p>
                      </div>
                    )}

                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Historial de la Postulación</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(selectedPostulacion.historial && selectedPostulacion.historial.length > 0 ? selectedPostulacion.historial : [
                          { estadoNuevo: 'Postulado', fechaCambio: selectedPostulacion.createdAt || selectedPostulacion.fechaPostulacion, motivo: 'Postulación enviada correctamente' }
                        ]).map((h: any, i: number) => (
                          <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid var(--accent)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 'bold' }}>{h.estadoNuevo}</span>
                              <span style={{ color: '#888' }}>{formatDate(h.fechaCambio)}</span>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>{h.motivo}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </div>
              
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                {userRole === 'empresa' && (
                  selectedPostulacion.egresado?.cvUrl ? (
                    <a className="btn btn-primary" href={selectedPostulacion.egresado.cvUrl} target="_blank" rel="noreferrer">Ver CV</a>
                  ) : (
                    <button className="btn btn-primary" disabled>Ver CV</button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
