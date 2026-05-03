'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EgresadosPage() {
  const { isLoggedIn, userRole, userId, userName, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  if (!authLoading && isLoggedIn && userRole !== 'admin' && userRole !== 'empresa') {
    return (
      <main className="page-shell">
        <div className="card">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para ver esta sección.</p>
        </div>
      </main>
    );
  }

  const [egresados, setEgresados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEgresado, setSelectedEgresado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [egresadoToDelete, setEgresadoToDelete] = useState<any>(null);
  const [todasHabilidades, setTodasHabilidades] = useState<string[]>([]);
  const [ofertasEmpresa, setOfertasEmpresa] = useState<any[]>([]);
  const [showAsociarModal, setShowAsociarModal] = useState(false);
  const [egresadoToAssociate, setEgresadoToAssociate] = useState<any>(null);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEgresados = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/egresados`);
      if (response.ok) {
        setEgresados(await response.json());
      }

      // También cargar habilidades para el filtro
      const habRes = await fetch(`${baseUrl}/habilidades`);
      if (habRes.ok) {
        const habData = await habRes.json();
        setTodasHabilidades(habData.map((h: any) => h.nombre).sort());
      }

      if (userRole === 'empresa' && userId) {
        const ofertasRes = await fetch(`${baseUrl}/ofertas?empresaId=${userId}&activa=true&estado=Aprobada`);
        if (ofertasRes.ok) {
          const ofertasData = await ofertasRes.json();
          setOfertasEmpresa(ofertasData.filter((oferta: any) => oferta.estado === 'Aprobada'));
        }
      }
    } catch (error) {
      console.error('Error fetching egresados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEgresados();
  }, [userRole, userId]);

  const confirmDelete = async () => {
    if (!egresadoToDelete) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/egresados/${egresadoToDelete.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Egresado eliminado');
        setShowDeleteModal(false);
        setEgresadoToDelete(null);
        fetchEgresados();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const handleAssociate = async () => {
    if (!egresadoToAssociate || !ofertaSeleccionada) {
      setError('Selecciona una oferta para asociar al egresado.');
      return;
    }

    try {
      const oferta = ofertasEmpresa.find((o: any) => o.id === ofertaSeleccionada);
      if (!oferta) {
        setError('Selecciona una oferta aprobada para asociar al egresado.');
        return;
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
      const response = await fetch(`${baseUrl}/egresados/${egresadoToAssociate.id}/asociar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaNombre: userName,
          ofertaTitulo: oferta?.titulo || 'una oferta activa',
          ofertaId: oferta?.id,
          empresaId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'No se pudo asociar al egresado');
      }

      setSuccess('✅ Asociación enviada al egresado');
      setShowAsociarModal(false);
      setEgresadoToAssociate(null);
      setOfertaSeleccionada('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ No se pudo asociar al egresado');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (egresado: any) => {
    setEditForm(egresado);
    setIsEditing(true);
    setSelectedEgresado(egresado);
    setShowModal(true);
  };

  const saveEdit = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
      
      // Limpiar los datos para no enviar objetos anidados que Prisma no maneja directamente en update top-level
      const { user, egresadoHabilidades, experienciasLaborales, formacionesAcademicas, postulaciones, ...dataToSave } = editForm;
      
      const response = await fetch(`${baseUrl}/egresados/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (response.ok) {
        setSuccess('✅ Egresado actualizado correctamente');
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
        setShowModal(false);
        setIsEditing(false);
        fetchEgresados();
      } else {
        const errorData = await response.json();
        setError(`❌ Error: ${errorData.message || 'No se pudo actualizar'}`);
        setSuccess(null);
      }
    } catch (error) {
      setError('❌ Error de conexión al actualizar');
      setSuccess(null);
    }
  };

  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [filterHabilidad, setFilterHabilidad] = useState('');

  const filteredEgresados = egresados.filter(
    (e) =>
      (e.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       e.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       e.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterCarrera || e.carrera?.toLowerCase() === filterCarrera.toLowerCase()) &&
      (!filterAnio || e.anioEgreso?.toString() === filterAnio) &&
      (!filterHabilidad || e.egresadoHabilidades?.some((h: any) => h.habilidad?.nombre === filterHabilidad))
  );

  const rawCarreras = [...new Set(egresados.map(e => e.carrera))].filter(Boolean);
  const normalizedCarreras = rawCarreras.reduce((acc: string[], curr: string) => {
    if (!acc.find(c => c.toLowerCase() === curr.toLowerCase())) {
      acc.push(curr);
    }
    return acc;
  }, []);
  const carreras = normalizedCarreras.sort();
  const anios = [...new Set(egresados.map(e => e.anioEgreso))].filter(Boolean).sort((a: any, b: any) => b - a);

  return (
    <main className="page-shell management-page">
      <div className="page-header" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1>{userRole === 'admin' ? '👥 Gestión de Egresados' : '🔍 Buscar Talento'}</h1>
          </div>
          <p>{userRole === 'admin' ? 'Administra la base de datos de egresados del sistema' : 'Encuentra a los mejores profesionales para tu empresa'}</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '24px', padding: '16px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '8px' }}>
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '24px', padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div className="card management-card">
          <div className="management-toolbar" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <select value={filterCarrera} onChange={(e) => setFilterCarrera(e.target.value)}>
                <option value="">Todas las carreras</option>
                {carreras.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <select value={filterAnio} onChange={(e) => setFilterAnio(e.target.value)}>
                <option value="">Todos los años</option>
                {anios.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <select value={filterHabilidad} onChange={(e) => setFilterHabilidad(e.target.value)}>
                <option value="">Habilidades</option>
                {todasHabilidades.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Cargando egresados...</p>
          ) : filteredEgresados.length === 0 ? (
            <p style={{ color: '#64748b' }}>No se encontraron egresados</p>
          ) : (
            <div className="table-container management-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Carrera</th>
                    <th>Año Egreso</th>
                    <th>Empleado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEgresados.map((egresado) => (
                    <tr key={egresado.id}>
                      <td>
                        {egresado.nombres} {egresado.apellidos}
                      </td>
                      <td>{egresado.dni}</td>
                      <td>{egresado.carrera}</td>
                      <td>{egresado.anioEgreso}</td>
                      <td>
                        <span className={`badge ${egresado.empleadoActualmente ? 'badge-success' : 'badge-neutral'}`} style={{ color: '#0f172a' }}>
                          {egresado.empleadoActualmente ? '✓ Sí' : '✗ No'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group management-actions">
                          <button className="btn btn-small btn-view" style={{ backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8' }} onClick={() => { setSelectedEgresado(egresado); setIsEditing(false); setShowModal(true); }}>Ver</button>
                          {userRole === 'empresa' && (
                            <button className="btn btn-small btn-primary" style={{ backgroundColor: '#0ea5e9', color: '#ffffff', borderColor: '#0284c7' }} onClick={() => { setEgresadoToAssociate(egresado); setOfertaSeleccionada(ofertasEmpresa[0]?.id || ''); setShowAsociarModal(true); }}>Asociar</button>
                          )}
                          {userRole === 'admin' && (
                            <>
                              <button className="btn btn-small btn-edit" style={{ backgroundColor: '#facc15', color: '#1f2937', borderColor: '#eab308' }} onClick={() => handleEdit(egresado)}>Editar</button>
                              <button className="btn btn-danger btn-small" style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#b91c1c' }} onClick={() => { setEgresadoToDelete(egresado); setShowDeleteModal(true); }}>Eliminar</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card management-modal" style={{ maxWidth: '400px', width: '100%', margin: '20px', padding: '0' }}>
              <div className="card-header">
                <h2 style={{ margin: 0 }}>⚠️ Confirmar Eliminación</h2>
              </div>
              <div style={{ padding: '20px 22px' }}>
              <p>¿Estás seguro de que deseas eliminar al egresado <strong>{egresadoToDelete?.nombres} {egresadoToDelete?.apellidos}</strong>?</p>
              <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '8px' }}>Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setEgresadoToDelete(null); }}>Cancelar</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Eliminar Definitivamente</button>
              </div>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedEgresado && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card management-modal" style={{ maxWidth: '800px', width: '100%', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                <h2 style={{ margin: 0 }}>{isEditing ? '📝 Editar Egresado' : `🎓 Perfil: ${selectedEgresado.nombres} ${selectedEgresado.apellidos}`}</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-small">X</button>
              </div>
              <div style={{ padding: '24px 0' }}>
                {isEditing ? (
                  <div className="form-container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Nombres</label>
                        <input type="text" value={editForm.nombres} onChange={(e) => setEditForm({...editForm, nombres: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Apellidos</label>
                        <input type="text" value={editForm.apellidos} onChange={(e) => setEditForm({...editForm, apellidos: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>DNI</label>
                        <input type="text" value={editForm.dni} onChange={(e) => setEditForm({...editForm, dni: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Carrera</label>
                        <input type="text" value={editForm.carrera} onChange={(e) => setEditForm({...editForm, carrera: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Año de Egreso</label>
                        <input type="number" value={editForm.anioEgreso} onChange={(e) => setEditForm({...editForm, anioEgreso: parseInt(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input type="text" value={editForm.telefono || ''} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Dirección</label>
                        <input type="text" value={editForm.direccion || ''} onChange={(e) => setEditForm({...editForm, direccion: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editForm.empleadoActualmente} onChange={(e) => setEditForm({...editForm, empleadoActualmente: e.target.checked})} />
                          ¿Está empleado actualmente?
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                      <div className="detail-group">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '2px' }}>Nombres</p>
                        <p style={{ fontWeight: '600' }}>{selectedEgresado.nombres} {selectedEgresado.apellidos}</p>
                      </div>
                      <div className="detail-group">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '2px' }}>DNI</p>
                        <p style={{ fontWeight: '600' }}>{selectedEgresado.dni}</p>
                      </div>
                      <div className="detail-group">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '2px' }}>Carrera</p>
                        <p style={{ fontWeight: '600' }}>{selectedEgresado.carrera}</p>
                      </div>
                      <div className="detail-group">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '2px' }}>Año Egreso</p>
                        <p style={{ fontWeight: '600' }}>{selectedEgresado.anioEgreso}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '24px' }}>
                      <div>
                        <section style={{ marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '12px' }}>🛠️ Habilidades</h3>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {selectedEgresado.egresadoHabilidades?.length > 0 ? (
                              selectedEgresado.egresadoHabilidades.map((h: any, i: number) => (
                                <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                                  {h.habilidad?.nombre} (Lvl {h.nivel})
                                </span>
                              ))
                            ) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Sin habilidades registradas.</p>}
                          </div>
                        </section>

                        <section>
                          <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '12px' }}>🏢 Experiencia Laboral</h3>
                          {selectedEgresado.experienciasLaborales?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {selectedEgresado.experienciasLaborales.map((exp: any, i: number) => (
                                <div key={i} style={{ padding: '8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                                  <p style={{ fontWeight: '700', margin: 0 }}>{exp.cargo} @ {exp.empresa}</p>
                                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{new Date(exp.fechaInicio).getFullYear()} - {exp.fechaFin ? new Date(exp.fechaFin).getFullYear() : 'Presente'}</p>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Sin experiencia.</p>}
                        </section>
                      </div>

                      <div>
                        <section style={{ marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '12px' }}>🎓 Formación</h3>
                          {selectedEgresado.formacionesAcademicas?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {selectedEgresado.formacionesAcademicas.map((form: any, i: number) => (
                                <div key={i} style={{ padding: '8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                                  <p style={{ fontWeight: '700', margin: 0 }}>{form.titulo}</p>
                                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{form.institucion}</p>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Sin formación.</p>}
                        </section>

                        <section>
                          <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '12px' }}>📬 Postulaciones</h3>
                          {selectedEgresado.postulaciones?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {selectedEgresado.postulaciones.slice(0, 3).map((p: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #eee', fontSize: '0.8rem' }}>
                                  <span>{p.oferta?.titulo}</span>
                                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{p.estado}</span>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Sin postulaciones.</p>}
                        </section>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '16px', position: 'sticky', bottom: 0, background: 'white' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                {isEditing && (
                  <button className="btn btn-primary" onClick={saveEdit}>💾 Guardar Cambios</button>
                )}
              </div>
            </div>
          </div>
        )}

        {showAsociarModal && egresadoToAssociate && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div className="card management-modal" style={{ maxWidth: '520px', width: '100%', margin: '20px', padding: '0' }}>
              <div className="card-header">
                <h2 style={{ margin: 0 }}>🔗 Asociar Talento</h2>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <p style={{ marginTop: 0 }}>
                  Enviarás una notificación a <strong>{egresadoToAssociate.nombres} {egresadoToAssociate.apellidos}</strong>.
                </p>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Selecciona tu oferta</label>
                  <select value={ofertaSeleccionada} onChange={(e) => setOfertaSeleccionada(e.target.value)}>
                    <option value="">Selecciona una oferta</option>
                    {ofertasEmpresa.map((oferta: any) => (
                      <option key={oferta.id} value={oferta.id}>{oferta.titulo}</option>
                    ))}
                  </select>
                </div>
                {ofertasEmpresa.length === 0 && (
                  <p style={{ color: '#b45309', fontSize: '0.9rem', marginTop: '0' }}>
                    No tienes ofertas aprobadas disponibles para asociar.
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => { setShowAsociarModal(false); setEgresadoToAssociate(null); setOfertaSeleccionada(''); }}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleAssociate} disabled={!ofertaSeleccionada || ofertasEmpresa.length === 0}>Enviar Asociación</button>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
