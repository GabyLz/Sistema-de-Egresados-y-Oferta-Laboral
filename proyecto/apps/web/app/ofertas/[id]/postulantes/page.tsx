'use client';
import { useAuth } from '../../../../context/AuthContext';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PostulantesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: ofertaId } = use(params);
  const { isLoggedIn, userRole, userId, loading: authLoading } = useAuth();
  const router = useRouter();

  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [oferta, setOferta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostulante, setSelectedPostulante] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({ puntaje: 5, comentarios: '', competencias: { comunicacion: 5, tecnica: 5, proactividad: 5 } });

  const [selectedEstado, setSelectedEstado] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
  };

  const getStatusBadge = (estado: string) => {
    if (!estado) return <span className="badge badge-secondary">❓ Pendiente</span>;
    const statusMap: any = {
      'postulado': { icon: '📝', label: 'Postulado', class: 'badge-primary', color: '#0f172a' },
      'en_revision': { icon: '🔍', label: 'En revisión', class: 'badge-warning', color: '#0f172a' },
      'entrevista': { icon: '🎯', label: 'Entrevista', class: 'badge-info', color: '#0f172a' },
      'contratado': { icon: '✅', label: 'Contratado', class: 'badge-success', color: '#0f172a' },
      'rechazado': { icon: '❌', label: 'Rechazado', class: 'badge-error', color: '#ffffff' },
    };
    const status = statusMap[estado.toLowerCase()] || { icon: '❓', label: estado, class: 'badge-secondary' };
    return <span className={`badge ${status.class}`} style={{ color: status.color, backgroundColor: estado.toLowerCase() === 'rechazado' ? '#dc2626' : undefined }}>{status.icon} {status.label}</span>;
  };

  const getMatchByStatus = (estado: string, baseMatch: number) => {
    const normalized = (estado || '').toLowerCase();

    if (normalized === 'rechazado') {
      return { value: 100, tone: '#dc2626', label: 'Rechazado' };
    }

    if (normalized === 'contratado') {
      return { value: 100, tone: '#047857', label: '100 %' };
    }

    if (normalized === 'entrevista') {
      return { value: 60, tone: '#0ea5e9', label: '60 %' };
    }

    if (normalized === 'en_revision' || normalized === 'en revisión' || normalized === 'revision' || normalized === 'revisión') {
      return { value: 40, tone: '#f59e0b', label: '40 %' };
    }

    if (normalized === 'postulado') {
      return { value: 20, tone: '#6b7280', label: '20 %' };
    }

    return { value: baseMatch, tone: getMatchTone(baseMatch), label: `${baseMatch} %` };
  };

  const getMatchTone = (match: number) => {
    if (match >= 80) return '#047857';
    if (match >= 60) return '#0ea5e9';
    if (match >= 40) return '#b45309';
    return '#6b7280';
  };

  const getEvaluationTone = (score: number) => {
    if (score >= 8) {
      return {
        label: 'Excelente',
        text: '#065f46',
        chipBg: '#d1fae5',
        border: '#6ee7b7',
      };
    }

    if (score >= 6) {
      return {
        label: 'Bueno',
        text: '#92400e',
        chipBg: '#fef3c7',
        border: '#fcd34d',
      };
    }

    return {
      label: 'Por mejorar',
      text: '#991b1b',
      chipBg: '#fee2e2',
      border: '#fca5a5',
    };
  };

  const sortedPostulaciones = [...postulaciones].sort((a, b) => {
    const weight = (estado: string) => {
      const normalized = (estado || '').toLowerCase();
      if (normalized === 'contratado') return 0;
      if (normalized === 'entrevista') return 1;
      if (normalized === 'en_revision' || normalized === 'en revisión' || normalized === 'revision' || normalized === 'revisión') return 2;
      if (normalized === 'postulado') return 3;
      return 4;
    };

    return weight(a.estado) - weight(b.estado) || new Date(b.fechaPostulacion).getTime() - new Date(a.fechaPostulacion).getTime();
  });

  const fetchPostulantes = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const [postRes, ofertaRes] = await Promise.all([
        fetch(`${baseUrl}/ofertas/${ofertaId}/postulaciones`),
        fetch(`${baseUrl}/ofertas/${ofertaId}`)
      ]);
      if (postRes.ok) setPostulaciones(await postRes.json());
      if (ofertaRes.ok) setOferta(await ofertaRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.replace('/login');
    if (userRole === 'empresa') fetchPostulantes();
  }, [isLoggedIn, authLoading, userRole]);

  const handleUpdateStatus = async (pid: string, estado: string) => {
    if (!comment.trim()) {
      setError('Por favor, ingresa un comentario o motivo para el cambio de estado.');
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/postulaciones/${pid}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, motivo: comment }),
      });
      
      if (response.ok) {
        setSuccess(`Estado actualizado a ${estado} correctamente.`);
        setTimeout(() => setSuccess(null), 3000);
        setComment('');
        await fetchPostulantes();
        // Mantener el detalle completo del candidato en el modal y solo sincronizar el estado visible
        setSelectedPostulante((current: any) =>
          current && current.id === pid
            ? {
                ...current,
                estado,
                comentario: comment,
              }
            : current,
        );
        setSelectedEstado(estado);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (e) { 
      console.error(e);
      setError('Error al actualizar el estado de la postulación.'); 
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSendEval = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const response = await fetch(`${baseUrl}/evaluaciones`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...evalForm, 
          postulacionId: selectedPostulante.id
        }),
      });

      if (response.ok) {
        // Traer las evaluaciones actualizadas para refrescar el historial
        const evaluacionesRes = await fetch(`${baseUrl}/evaluaciones/postulacion/${selectedPostulante.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (evaluacionesRes.ok) {
          const evaluacionesActualizadas = await evaluacionesRes.json();
          // Actualizar el selectedPostulante con las nuevas evaluaciones
          setSelectedPostulante((current: any) => ({
            ...current,
            evaluaciones: evaluacionesActualizadas
          }));
        }
        
        setSuccess('Evaluación guardada con éxito');
        setTimeout(() => setSuccess(null), 3000);
        setShowEvalModal(false);
        // Resetear el formulario de evaluación
        setEvalForm({ puntaje: 5, comentarios: '', competencias: { comunicacion: 5, tecnica: 5, proactividad: 5 } });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }
    } catch (e) { 
      console.error('Error al guardar evaluación:', e);
      setError('Error al guardar evaluación'); 
      setTimeout(() => setError(null), 3000);
    }
  };

  const calculateMatch = (egresadoHabilidades: any[], ofertaHabilidades: any[]) => {
    if (!ofertaHabilidades || ofertaHabilidades.length === 0) return 100;
    const egresadoHabIds = egresadoHabilidades.map(h => h.habilidadId);
    const matches = ofertaHabilidades.filter(h => egresadoHabIds.includes(h.habilidadId)).length;
    return Math.round((matches / ofertaHabilidades.length) * 100);
  };

  const handleContact = (egresado: any) => {
    if (!egresado?.user?.email) {
      setError('No se encontró el correo del candidato');
      setTimeout(() => setError(null), 3000);
      return;
    }
    const subject = encodeURIComponent(`Contacto sobre tu postulación a ${oferta.titulo}`);
    const body = encodeURIComponent(`Hola ${egresado.nombres}, nos gustaría contactarte para...`);
    window.location.href = `mailto:${egresado.user.email}?subject=${subject}&body=${body}`;
  };

  if (userRole !== 'empresa') return <p>Acceso denegado</p>;


  return (
    <main className="page-shell">
      <div className="page-header" style={{ marginTop: '20px' }}>
          <h1>👥 Postulantes: {oferta?.titulo}</h1>
          <p>Gestiona los candidatos que han aplicado a esta vacante</p>
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

        <div className="card chart-card">
          {loading ? <p>Cargando postulantes...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Candidato</th>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px', color: '#0f172a' }}>Estado</th>
                  <th style={{ padding: '12px' }}>Match</th>
                  <th style={{ padding: '12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedPostulaciones.map((p) => {
                  const matchValue = calculateMatch(p.egresado.egresadoHabilidades, oferta?.ofertaHabilidades);
                  const matchProgress = getMatchByStatus(p.estado, matchValue);

                  return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span>{p.egresado.nombres} {p.egresado.apellidos}</span>
                        {p.estado?.toLowerCase() === 'contratado' && (
                          <span className="badge badge-success" style={{ color: '#0f172a', width: 'fit-content' }}>Empleado contratado</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(p.fechaPostulacion)}</td>
                    <td style={{ padding: '12px', color: '#0f172a' }}>{getStatusBadge(p.estado)}</td>
                    <td style={{ padding: '12px', minWidth: '170px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
                          <span>Match</span>
                          <span style={{ color: p.estado?.toLowerCase() === 'rechazado' ? '#dc2626' : '#0f172a' }}>{matchProgress.label}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(matchProgress.value, 8)}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${matchProgress.tone}, ${matchProgress.tone}cc)` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>

                      <button className="btn btn-secondary btn-small" onClick={() => { 
                        setSelectedPostulante(p); 
                        setSelectedEstado(p.estado);
                        setShowModal(true); 
                      }}>Ver Perfil</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {showModal && selectedPostulante && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '1080px' }}>
              <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-0 pb-0" style={{ padding: '24px 32px' }}>
                  <h2 className="modal-title" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Perfil del Candidato</h2>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body" style={{ padding: '20px 24px' }}>
                  <div className="row g-3 align-items-start">
                    <div className="col-lg-7">
                      <div className="mb-3">
                        <h3 className="mb-1" style={{ fontWeight: '700' }}>{selectedPostulante.egresado?.nombres} {selectedPostulante.egresado?.apellidos}</h3>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>{selectedPostulante.egresado?.carrera} | Egreso {selectedPostulante.egresado?.anioEgreso}</p>
                        <div style={{ marginTop: '12px' }}>
                          <span className={`badge ${selectedPostulante.estado?.toLowerCase() === 'contratado' || selectedPostulante.egresado?.empleadoActualmente ? 'badge-success' : 'badge-neutral'}`} style={{ color: '#0f172a' }}>
                            {selectedPostulante.estado?.toLowerCase() === 'contratado' || selectedPostulante.egresado?.empleadoActualmente ? 'Empleado contratado' : 'Disponible'}
                          </span>
                        </div>
                        <div className="d-flex flex-column gap-2 mt-3" style={{ fontSize: '0.95rem' }}>
                          <span>📧 {selectedPostulante.egresado?.user?.email}</span>
                          <span>📱 {selectedPostulante.egresado?.telefono || 'No registrado'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="h5 mb-3" style={{ fontWeight: '600' }}>Habilidades</h4>
                        <div className="d-flex gap-2 flex-wrap">
                          {selectedPostulante.egresado?.egresadoHabilidades?.map((h: any, i: number) => (
                            <span key={i} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                              {h.habilidad?.nombre}
                            </span>
                          )) || <p className="text-muted small italic">No hay habilidades registradas.</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-5" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                      <h4 className="h5 mb-3" style={{ fontWeight: '600' }}>Gestión de Postulación</h4>
                      <div className="mb-3">
                        <label className="form-label small text-muted">Estado Actual</label>
                        <select className="form-select" style={{ borderRadius: '8px', padding: '10px' }} value={selectedEstado} onChange={(e) => setSelectedEstado(e.target.value)}>
                          <option value="postulado">Postulado</option>
                          <option value="en_revision">En revisión</option>
                          <option value="entrevista">Entrevista</option>
                          <option value="contratado">Contratado</option>
                          <option value="rechazado">Rechazado</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-muted">Comentario Interno</label>
                        <textarea className="form-control" style={{ borderRadius: '8px' }} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un motivo o comentario..."></textarea>
                      </div>
                      <div className="mt-3 pt-3 border-top">
                        <p className="small text-muted mb-2">Comentario Actual</p>
                        <div className="p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                          {selectedPostulante.comentario?.trim() ? selectedPostulante.comentario : 'Sin comentario registrado.'}
                        </div>
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-success" style={{ padding: '10px', borderRadius: '8px' }} onClick={() => handleUpdateStatus(selectedPostulante.id, selectedEstado)}>
                          💾 Guardar Cambios de Estado
                        </button>
                        <button className="btn btn-primary mt-2" style={{ padding: '10px', borderRadius: '8px' }} onClick={() => handleContact(selectedPostulante.egresado)}>
                           ✉️ Contactar Candidato
                         </button>
                         {selectedPostulante.estado?.toLowerCase() === 'entrevista' && (
                           <button className="btn btn-info text-white" style={{ padding: '10px', borderRadius: '8px' }} onClick={() => setShowEvalModal(true)}>
                             📝 Evaluar Entrevista
                           </button>
                         )}
                      </div>
                      <div className="mt-3 pt-3 border-top">
                        <p className="small text-muted mb-2">Estado Público Actual</p>
                        {getStatusBadge(selectedPostulante.estado)}
                      </div>
                    </div>
                  </div>

                  {selectedPostulante.historial && selectedPostulante.historial.length > 0 && (
                    <div className="mt-4 pt-3 border-top">
                      <h4 className="h5 mb-3" style={{ fontWeight: '600' }}>Todos los Comentarios</h4>
                      <div className="d-flex flex-column gap-3">
                        {selectedPostulante.historial.map((item: any, index: number) => (
                          <div key={item.id || index} className="p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-dark">{item.estadoAnterior ? `${item.estadoAnterior} → ${item.estadoNuevo}` : item.estadoNuevo}</span>
                              <span className="small text-muted">{formatDate(item.fechaCambio)}</span>
                            </div>
                            <p className="mb-0" style={{ color: '#0f172a' }}>{item.motivo || 'Sin comentario.'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mt-2 pt-3 border-top">
                    <div className="col-lg-5">
                      <h4 className="h5 mb-3" style={{ fontWeight: '600' }}>Experiencia Laboral</h4>
                      {selectedPostulante.egresado?.experienciasLaborales && selectedPostulante.egresado.experienciasLaborales.length > 0 ? (
                        selectedPostulante.egresado.experienciasLaborales.map((exp: any, i: number) => (
                          <div key={i} className="mb-3 p-3 bg-light rounded-3" style={{ border: '1px solid #eee' }}>
                            <p className="mb-1"><strong>{exp.cargo}</strong> en <span style={{ color: 'var(--accent)' }}>{exp.empresa}</span></p>
                            <p className="small text-muted mb-0" style={{ lineHeight: '1.5' }}>{exp.descripcion}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small italic">Sin experiencia registrada.</p>
                      )}
                    </div>

                    <div className="col-lg-7">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                      <div>
                        <h4 className="h5 mb-1" style={{ fontWeight: 700, color: '#0f172a' }}>Historial de Evaluaciones</h4>
                        <p className="mb-0" style={{ color: '#64748b', fontSize: '0.92rem' }}>Seguimiento del desempeño del candidato en el proceso.</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        minWidth: '170px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.18)'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.75, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Promedio General</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 700 }}>
                          {selectedPostulante.evaluaciones?.length
                            ? `${(
                                selectedPostulante.evaluaciones.reduce((acc: number, ev: any) => acc + (Number(ev.puntaje) || 0), 0) /
                                selectedPostulante.evaluaciones.length
                              ).toFixed(1)}/10`
                            : 'Sin data'}
                        </p>
                      </div>
                    </div>

                    {selectedPostulante.evaluaciones && selectedPostulante.evaluaciones.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {selectedPostulante.evaluaciones.map((ev: any, i: number) => {
                          const tone = getEvaluationTone(Number(ev.puntaje) || 0);
                          const tecnica = Number(ev.competencias?.tecnica) || 0;
                          const comunicacion = Number(ev.competencias?.comunicacion) || 0;
                          const proactividad = Number(ev.competencias?.proactividad) || 0;

                          return (
                            <div
                              key={i}
                              style={{
                                border: `1px solid ${tone.border}`,
                                borderRadius: '14px',
                                overflow: 'hidden',
                                background: '#ffffff',
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)'
                              }}
                            >
                              <div
                                className="d-flex justify-content-between align-items-center flex-wrap gap-2"
                                style={{
                                  padding: '12px 16px',
                                  background: 'linear-gradient(90deg, #f8fafc 0%, #eef2ff 100%)',
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Evaluación #{i + 1}</span>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: tone.text,
                                      background: tone.chipBg,
                                      border: `1px solid ${tone.border}`,
                                      borderRadius: '999px',
                                      padding: '4px 10px'
                                    }}
                                  >
                                    {tone.label}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.86rem' }}>
                                  <span style={{ color: '#475569' }}>{formatDate(ev.fecha)}</span>
                                  <span style={{ fontWeight: 700, color: tone.text }}>Puntaje: {ev.puntaje}/10</span>
                                </div>
                              </div>

                              <div style={{ padding: '16px' }}>
                                <p style={{ margin: '0 0 14px', color: '#334155', lineHeight: 1.5 }}>
                                  {ev.comentarios?.trim() ? ev.comentarios : 'Sin observaciones registradas.'}
                                </p>

                                <div className="d-flex flex-column gap-2">
                                  <div>
                                    <div className="d-flex justify-content-between" style={{ fontSize: '0.83rem', color: '#475569' }}>
                                      <span>Competencia Técnica</span>
                                      <strong style={{ color: '#0f172a' }}>{tecnica}/5</strong>
                                    </div>
                                    <div style={{ marginTop: '6px', height: '8px', borderRadius: '999px', background: '#e2e8f0' }}>
                                      <div style={{ width: `${(tecnica / 5) * 100}%`, height: '100%', borderRadius: '999px', background: '#2563eb' }} />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="d-flex justify-content-between" style={{ fontSize: '0.83rem', color: '#475569' }}>
                                      <span>Comunicación</span>
                                      <strong style={{ color: '#0f172a' }}>{comunicacion}/5</strong>
                                    </div>
                                    <div style={{ marginTop: '6px', height: '8px', borderRadius: '999px', background: '#e2e8f0' }}>
                                      <div style={{ width: `${(comunicacion / 5) * 100}%`, height: '100%', borderRadius: '999px', background: '#0d9488' }} />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="d-flex justify-content-between" style={{ fontSize: '0.83rem', color: '#475569' }}>
                                      <span>Proactividad</span>
                                      <strong style={{ color: '#0f172a' }}>{proactividad}/5</strong>
                                    </div>
                                    <div style={{ marginTop: '6px', height: '8px', borderRadius: '999px', background: '#e2e8f0' }}>
                                      <div style={{ width: `${(proactividad / 5) * 100}%`, height: '100%', borderRadius: '999px', background: '#7c3aed' }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          border: '1px dashed #cbd5e1',
                          borderRadius: '14px',
                          padding: '24px',
                          background: '#f8fafc',
                          textAlign: 'center',
                          color: '#64748b'
                        }}
                      >
                        Aún no se han registrado evaluaciones para este candidato.
                      </div>
                    )}
                    </div>
                  </div>

                  {selectedPostulante.egresado?.cvUrl && (
                    <div className="mt-4 pt-3 text-center">
                      <a href={selectedPostulante.egresado.cvUrl} target="_blank" rel="noreferrer" className="btn btn-outline-secondary px-4" style={{ borderRadius: '20px' }}>
                        📄 Ver CV
                      </a>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0" style={{ padding: '16px 32px 32px' }}>
                  <button type="button" className="btn btn-secondary px-4" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>Cerrar Ventana</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEvalModal && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1100 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-0 pb-0" style={{ padding: '24px 32px' }}>
                  <h5 className="modal-title fw-bold" style={{ color: 'var(--success)' }}>Evaluación de Entrevista</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEvalModal(false)}></button>
                </div>
                <div className="modal-body" style={{ padding: '24px 32px' }}>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Puntaje General (1-10)</label>
                    <input type="number" className="form-control" style={{ borderRadius: '8px', padding: '12px' }} min="1" max="10" value={evalForm.puntaje} onChange={(e) => setEvalForm({...evalForm, puntaje: parseInt(e.target.value)})} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold d-flex justify-content-between">
                      Competencia Técnica <span>{evalForm.competencias.tecnica}/5</span>
                    </label>
                    <input type="range" className="form-range" min="1" max="5" value={evalForm.competencias.tecnica} onChange={(e) => setEvalForm({...evalForm, competencias: {...evalForm.competencias, tecnica: parseInt(e.target.value)}})} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold d-flex justify-content-between">
                      Habilidades de Comunicación <span>{evalForm.competencias.comunicacion}/5</span>
                    </label>
                    <input type="range" className="form-range" min="1" max="5" value={evalForm.competencias.comunicacion} onChange={(e) => setEvalForm({...evalForm, competencias: {...evalForm.competencias, comunicacion: parseInt(e.target.value)}})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Observaciones y Comentarios</label>
                    <textarea className="form-control" style={{ borderRadius: '8px' }} rows={4} value={evalForm.comentarios} onChange={(e) => setEvalForm({...evalForm, comentarios: e.target.value})} placeholder="Escribe aquí el resumen de la entrevista..."></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0" style={{ padding: '16px 32px 32px' }}>
                  <button type="button" className="btn btn-light px-4" style={{ borderRadius: '8px' }} onClick={() => setShowEvalModal(false)}>Cancelar</button>
                  <button type="button" className="btn btn-success px-4" style={{ borderRadius: '8px', background: 'var(--success)' }} onClick={handleSendEval}>Guardar Evaluación</button>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
