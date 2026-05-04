'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OfertaLaboral {
  id: string;
  titulo: string;
  empresa: { razonSocial: string };
  ubicacion: string;
  tipo: string;
  salarioMin?: number;
  salarioMax?: number;
  estado: string;
  createdAt: string;
  fechaPublicacion?: string;
  fechaCierre?: string;
  empresaId: string;
}

const toDateKey = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const canStartApplications = (fechaPublicacion?: string | null) => {
  const publishKey = toDateKey(fechaPublicacion);
  if (!publishKey) return true;
  return publishKey <= new Date().toISOString().slice(0, 10);
};

export default function OfertasPage() {
  const { isLoggedIn, userRole, userId, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);
  const [ofertas, setOfertas] = useState<OfertaLaboral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterUbicacion, setFilterUbicacion] = useState('');
  const [filterStatus, setFilterStatus] = useState(userRole === 'admin' ? 'Pendiente' : '');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterSalarioMin, setFilterSalarioMin] = useState('');
  const [filterSalarioMax, setFilterSalarioMax] = useState('');
  const [selectedOferta, setSelectedOferta] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState('');
  const [isPostulando, setIsPostulando] = useState(false);
  const [showPostularModal, setShowPostularModal] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);

  const [userPostulations, setUserPostulations] = useState<string[]>([]);

  const fetchOfertas = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/ofertas`);
      if (response.ok) {
        const data = await response.json();
        setOfertas(data);
      }

      // Si es egresado, obtener sus postulaciones para bloquear botones
      if (userRole === 'egresado' && userId) {
        const postRes = await fetch(`${baseUrl}/postulaciones/egresado/${userId}`);
        if (postRes.ok) {
          const posts = await postRes.json();
          setUserPostulations(posts.map((p: any) => p.ofertaId));
        }
      }
    } catch (error) {
      console.error('Error fetching ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostular = async (id: string) => {
    if (!userId) {
      setError('❌ Debes iniciar sesión para postular');
      return;
    }
    setIsPostulando(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
      const response = await fetch(`${baseUrl}/postulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ egresadoId: userId, ofertaId: id }),
      });
      if (response.ok) {
        setSuccess('¡Postulación exitosa! Recibirás una notificación pronto.');
        setTimeout(() => setSuccess(null), 4000);
        setShowModal(false);
      } else {
        const err = await response.json();
        setError(err.message || 'Error al postular');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsPostulando(false);
      setShowPostularModal(null);
    }
  };

  const filteredOfertas = ofertas.filter((o) => {
    const matchesSearch = o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || o.tipo === filterType;
    const matchesStatus = userRole === 'admin' 
      ? (!filterStatus || o.estado.toLowerCase() === filterStatus.toLowerCase()) 
      : (userRole === 'empresa' 
          ? (!filterStatus || o.estado.toLowerCase() === filterStatus.toLowerCase()) 
          : o.estado.toLowerCase() === 'aprobada');
    const matchesUbicacion = !filterUbicacion || o.ubicacion === filterUbicacion;
    const matchesModalidad = !filterModalidad || (o as any).modalidad === filterModalidad;
    const matchesSalario = (!filterSalarioMin || (o as any).salarioMax >= parseInt(filterSalarioMin)) && 
                          (!filterSalarioMax || (o as any).salarioMin <= parseInt(filterSalarioMax));
    
    // Si es empresa, solo ver sus propias ofertas
    const isOwner = userRole === 'empresa' ? o.empresaId === userId : true;
    
    return matchesSearch && matchesType && matchesStatus && matchesUbicacion && matchesModalidad && matchesSalario && isOwner;
  });

  const modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'remoto', label: 'Remoto' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  const tiposContrato = [
    { value: 'fulltime', label: 'Tiempo Completo' },
    { value: 'parttime', label: 'Medio Tiempo' },
    { value: 'freelance', label: 'Por Proyecto' }
  ];

  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const handleModerate = async (id: string, nuevoEstado: string) => {
    setModeratingId(id);
    setError(null);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/ofertas/${id}/moderacion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, comentario: moderationComment }),
      });
      if (response.ok) {
        setSuccess(`Oferta ${nuevoEstado.toLowerCase()} correctamente`);
        setTimeout(() => setSuccess(null), 3000);
        setModerationComment('');
        fetchOfertas();
      } else {
        const text = await response.text();
        let msg = 'No se pudo moderar la oferta';
        try {
          const err = JSON.parse(text);
          msg = err.message || msg;
        } catch {
          if (text && text.length < 180) msg = text;
        }
        setError(`❌ ${msg}`);
        setTimeout(() => setError(null), 3500);
      }
    } catch (error) {
      setError('Error al moderar oferta');
      setTimeout(() => setError(null), 3000);
    } finally {
      setModeratingId(null);
    }
  };

  useEffect(() => {
    fetchOfertas();
    const saved = localStorage.getItem('savedSearch');
    if (saved) {
      const { searchTerm, filterType, filterUbicacion, filterModalidad, filterSalarioMin, filterSalarioMax } = JSON.parse(saved);
      setSearchTerm(searchTerm || '');
      setFilterType(filterType || '');
      setFilterUbicacion(filterUbicacion || '');
      setFilterModalidad(filterModalidad || '');
      setFilterSalarioMin(filterSalarioMin || '');
      setFilterSalarioMax(filterSalarioMax || '');
    }
  }, []);


  const handleDelete = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/ofertas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Oferta eliminada correctamente');
        setTimeout(() => setSuccess(null), 3000);
        fetchOfertas();
      }
    } catch (error) {
      setError('Error al eliminar oferta');
      setTimeout(() => setError(null), 3000);
    } finally {
      setShowDeleteModal(null);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const handleEdit = (oferta: any) => {
    setSelectedOferta(oferta);
    setEditForm({
      id: oferta.id,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      ubicacion: oferta.ubicacion,
      tipo: oferta.tipo,
      salarioMin: oferta.salarioMin,
      salarioMax: oferta.salarioMax,
      fechaCierre: oferta.fechaCierre ? oferta.fechaCierre.split('T')[0] : '',
      fechaPublicacion: oferta.fechaPublicacion ? oferta.fechaPublicacion.split('T')[0] : '',
      modalidad: oferta.modalidad || 'presencial',
      tipoContrato: oferta.tipoContrato || 'fulltime',
      habilidadesIds: oferta.ofertaHabilidades?.map((oh: any) => oh.habilidadId) || [],
      estado: oferta.estado
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditForm({
      titulo: '',
      ubicacion: '',
      modalidad: 'presencial',
      tipoContrato: 'fulltime',
      salarioMin: 0,
      salarioMax: 0,
      descripcion: '',
      fechaCierre: '',
      fechaPublicacion: new Date().toISOString().slice(0,10),
      habilidadesIds: [],
      estado: 'Pendiente'
    });
    setIsEditing(true);
    setSelectedOferta({} as any);
    setShowModal(true);
  };

  const handleUpdateStatus = async (id: string, nuevoEstado: string) => {
    let motivo = null;
    if (nuevoEstado === 'Cerrada') {
      // Para simplificar, usamos un prompt pero capturamos el error si se cancela
      motivo = window.prompt('Ingrese el motivo del cierre:');
      if (motivo === null) return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/ofertas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, motivo }),
      });
      if (response.ok) {
        setSuccess(`Oferta marcada como ${nuevoEstado}`);
        setTimeout(() => setSuccess(null), 3000);
        fetchOfertas();
      }
    } catch (e) { setError('Error al actualizar estado'); }
  };

  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/habilidades`)
      .then(res => res.json())
      .then(data => setAvailableSkills(data));

    if (userRole === 'admin') {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/empresas`)
        .then(res => res.json())
        .then(data => setAvailableCompanies(data));
    }
  }, [userRole]);

  const saveOferta = async (estadoFinal: 'Aprobada' | 'Pendiente' | 'Borrador' = 'Pendiente') => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
      const url = editForm.id 
        ? `${baseUrl}/ofertas/${editForm.id}` 
        : `${baseUrl}/ofertas`;
      const method = editForm.id ? 'PUT' : 'POST';

      const body = {
        titulo: editForm.titulo,
        descripcion: editForm.descripcion,
        ubicacion: editForm.ubicacion,
        modalidad: editForm.modalidad,
        tipoContrato: editForm.tipoContrato,
        salarioMin: parseFloat(editForm.salarioMin) || 0,
        salarioMax: parseFloat(editForm.salarioMax) || 0,
        fechaCierre: editForm.fechaCierre ? new Date(editForm.fechaCierre).toISOString() : null,
        fechaPublicacion: editForm.fechaPublicacion ? new Date(editForm.fechaPublicacion).toISOString() : null,
        habilidadesIds: editForm.habilidadesIds || [],
        estado: estadoFinal,
        activa: estadoFinal === 'Aprobada',
        empresaId: userRole === 'empresa' ? userId : (editForm.empresaId || (availableCompanies.length > 0 ? availableCompanies[0].id : ''))
      };

      // Validación cliente: fechaPublicacion (inicio) debe ser <= fechaCierre (final)
      if (editForm.fechaPublicacion && editForm.fechaCierre) {
        const inicio = new Date(editForm.fechaPublicacion);
        const fin = new Date(editForm.fechaCierre);
        if (inicio > fin) {
          setError('❌ La fecha de inicio debe ser anterior o igual a la fecha final');
          setTimeout(() => setError(null), 5000);
          return;
        }
      }
      
      if (!body.empresaId) {
        setError('❌ Error: Debe seleccionar una empresa');
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setSuccess(editForm.id ? '✅ Oferta actualizada' : (estadoFinal === 'Borrador' ? '💾 Borrador guardado' : '🚀 Oferta enviada a revisión'));
        setTimeout(() => setSuccess(null), 3000);
        setShowModal(false);
        setIsEditing(false);
        fetchOfertas();
      } else {
        const err = await response.json();
        setError(`❌ Error: ${err.message || 'No se pudo guardar la oferta'}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError('❌ Error de conexión al guardar oferta');
      setTimeout(() => setError(null), 3000);
    }
  };

  const ubicaciones = [...new Set(ofertas.map((o) => o.ubicacion))].filter(Boolean);
  const tiposOfertas = [...new Set(ofertas.map((o) => o.tipo))].filter(Boolean);

  return (
    <main className="page-shell">
      <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1>💼 Ofertas Laborales</h1>
            {(userRole === 'empresa' || userRole === 'admin') && (
              <button type="button" className="btn btn-primary" onClick={handleCreate}>
                + Nueva Oferta
              </button>
            )}
          </div>
          <p>Explora y gestiona las oportunidades laborales del sistema</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '24px', padding: '16px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '8px' }}>
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '24px', padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px' }}>
            ❌ {error}
          </div>
        )}

        <div className="card" style={{ borderLeft: '4px solid var(--accent)', background: 'white', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px', display: 'block' }}>🔍 Búsqueda rápida</label>
              <input
                type="text"
                placeholder="Puesto, empresa o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px', display: 'block' }}>📍 Ubicación</label>
              <select value={filterUbicacion} onChange={(e) => setFilterUbicacion(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <option value="">Todas las ciudades</option>
                {ubicaciones.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px', display: 'block' }}>🏠 Modalidad</label>
              <select value={filterModalidad} onChange={(e) => setFilterModalidad(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <option value="">Cualquier modalidad</option>
                {modalidades.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: '42px' }}
                onClick={fetchOfertas}
              >
                Buscar Ahora
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Salario:</span>
                <input type="number" placeholder="Min" value={filterSalarioMin} onChange={(e) => setFilterSalarioMin(e.target.value)} style={{ width: '80px', padding: '4px 8px', fontSize: '0.85rem' }} />
                <span>-</span>
                <input type="number" placeholder="Max" value={filterSalarioMax} onChange={(e) => setFilterSalarioMax(e.target.value)} style={{ width: '80px', padding: '4px 8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tipo:</span>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                  <option value="">Todos</option>
                  <option value="Tiempo Completo">T. Completo</option>
                  <option value="Medio Tiempo">M. Tiempo</option>
                  <option value="Por Proyecto">Proyecto</option>
                </select>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => {
                setSearchTerm(''); setFilterUbicacion(''); setFilterModalidad(''); setFilterType(''); setFilterSalarioMin(''); setFilterSalarioMax('');
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>


        {loading ? (
          <div className="card">
            <p>Cargando ofertas...</p>
          </div>
        ) : filteredOfertas.length === 0 ? (
          <div className="card">
            <p style={{ color: '#64748b' }}>No se encontraron ofertas disponibles</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredOfertas.map((oferta) => {
              const estadoKey = (oferta.estado || '').toLowerCase();
              const borderColor =
                estadoKey === 'aprobada' ? '#10b981' :
                estadoKey === 'rechazada' ? '#ef4444' :
                estadoKey === 'cerrada' ? '#64748b' :
                estadoKey === 'borrador' ? '#64748b' :
                '#f59e0b';
              const badgeClass =
                estadoKey === 'aprobada' ? 'badge-success' :
                estadoKey === 'rechazada' ? 'badge-error' :
                estadoKey === 'cerrada' ? 'badge-neutral' :
                estadoKey === 'borrador' ? 'badge-secondary' :
                'badge-warning';

              return (
              <div key={oferta.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', transition: 'transform 0.2s', borderTop: `4px solid ${borderColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{oferta.titulo}</h3>
                  <span className={`badge ${badgeClass}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {oferta.estado}
                  </span>
                </div>

                <div style={{ flex: '1' }}>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ opacity: 0.7 }}>🏢</span> <strong>{oferta.empresa?.razonSocial}</strong>
                  </p>

                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ opacity: 0.7 }}>📍</span> {oferta.ubicacion} • {oferta.tipo}
                  </p>

                  {oferta.salarioMin && oferta.salarioMax && (
                    <p style={{ color: '#16a34a', fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>
                      S/ {oferta.salarioMin?.toLocaleString()} - S/ {oferta.salarioMax?.toLocaleString()}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div className="btn-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-small" style={{ flex: 1 }} onClick={() => { setSelectedOferta(oferta); setIsEditing(false); setShowModal(true); }}>Ver Detalles</button>
                    
                    {userRole === 'egresado' && (
                      (() => {
                        const isExpired = oferta.fechaCierre && new Date(oferta.fechaCierre) < new Date();
                        const isNotPublishedYet = !canStartApplications(oferta.fechaPublicacion);
                        const alreadyApplied = userPostulations.includes(oferta.id);
                        
                        if (alreadyApplied) {
                          return <button className="btn btn-success btn-small" style={{ flex: 1, opacity: 0.8 }} disabled>✅ Postulado</button>;
                        }
                        
                        if (isNotPublishedYet) {
                          return <button className="btn btn-secondary btn-small" style={{ flex: 1, opacity: 0.6 }} disabled title={`Las postulaciones inician el ${oferta.fechaPublicacion ? new Date(oferta.fechaPublicacion).toLocaleDateString() : 'pronto'}`}>⏳ Disponible desde {oferta.fechaPublicacion ? new Date(oferta.fechaPublicacion).toLocaleDateString() : 'la fecha de publicación'}</button>;
                        }

                        if (isExpired) {
                          return <button className="btn btn-secondary btn-small" style={{ flex: 1, opacity: 0.6 }} disabled title="La fecha final ha pasado">⌛ Expirada</button>;
                        }

                        return <button className="btn btn-primary btn-small" style={{ flex: 1 }} onClick={() => setShowPostularModal(oferta.id)}>Postularme</button>;
                      })()
                    )}

                    {userRole === 'admin' && (oferta.estado || '').toLowerCase() === 'pendiente' && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Motivo..." 
                          value={moderationComment}
                          onChange={(e) => setModerationComment(e.target.value)}
                          disabled={moderatingId === oferta.id}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                        <button className="btn btn-success btn-small" disabled={moderatingId === oferta.id} onClick={() => handleModerate(oferta.id, 'Aprobada')}>
                          {moderatingId === oferta.id ? '...' : 'Aprobar'}
                        </button>
                        <button className="btn btn-danger btn-small" disabled={moderatingId === oferta.id} onClick={() => handleModerate(oferta.id, 'Rechazada')}>
                          {moderatingId === oferta.id ? '...' : 'Rechazar'}
                        </button>
                      </div>
                    )}

                    {(userRole === 'admin' || (userRole === 'empresa' && oferta.empresaId === userId)) && (
                      <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                        <button className="btn btn-secondary btn-small" style={{ flex: 1 }} onClick={() => handleEdit(oferta)}>
                          {oferta.estado === 'Borrador' ? '📝 Editar y Publicar' : 'Editar'}
                        </button>
                        {userRole === 'empresa' && oferta.estado === 'Aprobada' && (
                          <button className="btn btn-warning btn-small" style={{ flex: 1 }} onClick={() => handleUpdateStatus(oferta.id, 'Cerrada')}>Cerrar</button>
                        )}
                        {userRole === 'empresa' && (
                          oferta.estado === 'Aprobada' ? (
                            <button className="btn btn-primary btn-small" style={{ flex: 1, minWidth: 'fit-content' }} onClick={() => router.push(`/ofertas/${oferta.id}/postulantes`)}>Candidatos</button>
                          ) : (
                            <button className="btn btn-secondary btn-small" style={{ flex: 1, minWidth: 'fit-content', opacity: 0.7 }} disabled title="Disponible solo cuando la oferta esté aprobada">Candidatos</button>
                          )
                        )}
                        <button className="btn btn-danger btn-small" title="Eliminar" onClick={() => setShowDeleteModal(oferta.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Modal Confirmar Eliminación */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px', textAlign: 'center' }}>
              <h3>⚠️ Eliminar Oferta</h3>
              <p style={{ margin: '16px 0', color: '#64748b' }}>
                ¿Estás seguro de que deseas eliminar esta oferta laboral? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showDeleteModal)}>Eliminar Definitivamente</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmar Postulación */}
        {showPostularModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px', textAlign: 'center' }}>
              <h3>🚀 Confirmar Postulación</h3>
              <p style={{ margin: '16px 0', color: '#64748b' }}>
                ¿Estás seguro de que deseas postular a esta oferta? Tu perfil será enviado a la empresa para revisión.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowPostularModal(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => handlePostular(showPostularModal)} disabled={isPostulando}>
                  {isPostulando ? 'Enviando...' : 'Confirmar Postulación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedOferta && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{isEditing ? 'Editar Oferta' : selectedOferta.titulo}</h2>
                  {!isEditing && <p style={{ color: 'var(--accent)', fontWeight: '600', margin: '4px 0' }}>{selectedOferta.empresa?.razonSocial}</p>}
                </div>
                <button className="btn btn-secondary btn-small" onClick={() => { setShowModal(false); setIsEditing(false); }}>Cerrar</button>
              </div>

              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="detail-item">
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>📍 Ubicación</p>
                      <p style={{ fontWeight: '500' }}>{selectedOferta.ubicacion} ({selectedOferta.modalidad})</p>
                    </div>
                    <div className="detail-item">
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>💼 Tipo Contrato</p>
                      <p style={{ fontWeight: '500' }}>{selectedOferta.tipoContrato || 'No especificado'}</p>
                    </div>
                    <div className="detail-item">
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>💰 Rango Salarial</p>
                      <p style={{ fontWeight: '600', color: 'var(--success)' }}>
                        {selectedOferta.salarioMin && selectedOferta.salarioMax 
                          ? `S/ ${selectedOferta.salarioMin.toLocaleString()} - S/ ${selectedOferta.salarioMax.toLocaleString()}`
                          : 'No especificado'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>📅 Fecha de publicación / inicio</p>
                      <p style={{ fontWeight: '500' }}>{selectedOferta.fechaPublicacion ? new Date(selectedOferta.fechaPublicacion).toLocaleDateString() : 'Disponible de inmediato'}</p>
                    </div>
                    <div className="detail-item">
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>📌 Fecha final</p>
                      <p style={{ fontWeight: '500' }}>{selectedOferta.fechaCierre ? new Date(selectedOferta.fechaCierre).toLocaleDateString() : 'Sin fecha final'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Descripción del Puesto</h3>
                    <p style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>{selectedOferta.descripcion}</p>
                  </div>

                  {selectedOferta.habilidadesRequeridas && (
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Habilidades Requeridas</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedOferta.habilidadesRequeridas.map((h: any, i: number) => (
                          <span key={i} className="badge badge-primary">{h.nombre}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userRole === 'egresado' && (
                    <div style={{ marginTop: '12px', padding: '16px', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce3ff' }}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#004a99' }}>
                        <strong>Recomendación:</strong> Tu perfil coincide en un 85% con esta oferta.
                      </p>
                      {(() => {
                        const isExpired = selectedOferta.fechaCierre && new Date(selectedOferta.fechaCierre) < new Date();
                        const isNotPublishedYet = !canStartApplications(selectedOferta.fechaPublicacion);
                        const alreadyApplied = userPostulations.includes(selectedOferta.id);
                        
                        if (alreadyApplied) {
                          return <button className="btn btn-success" style={{ width: '100%' }} disabled>✅ Ya te has postulado a esta oferta</button>;
                        }
                        
                        if (isNotPublishedYet) {
                          return <button className="btn btn-secondary" style={{ width: '100%' }} disabled title={`Las postulaciones inician el ${selectedOferta.fechaPublicacion ? new Date(selectedOferta.fechaPublicacion).toLocaleDateString() : 'pronto'}`}>⏳ Disponible desde {selectedOferta.fechaPublicacion ? new Date(selectedOferta.fechaPublicacion).toLocaleDateString() : 'la fecha de publicación'}</button>;
                        }

                        if (isExpired) {
                          return <button className="btn btn-secondary" style={{ width: '100%' }} disabled>⌛ Esta oferta ya llegó a su fecha final</button>;
                        }

                        return (
                          <button 
                            className="btn btn-primary" 
                            style={{ width: '100%' }}
                            onClick={() => setShowPostularModal(selectedOferta.id)}
                            disabled={isPostulando}
                          >
                            {isPostulando ? 'Procesando...' : '🚀 Postular a esta vacante'}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); saveOferta(editForm.estado === 'Borrador' ? 'Pendiente' : 'Pendiente'); }}>
                  {userRole === 'admin' && (
                    <div className="form-group">
                      <label>Seleccionar Empresa</label>
                      <select 
                        value={editForm.empresaId || ''} 
                        onChange={(e) => setEditForm({ ...editForm, empresaId: e.target.value })}
                        required
                      >
                        <option value="">-- Seleccione una empresa --</option>
                        {availableCompanies.map(c => (
                          <option key={c.id} value={c.id}>{c.razonSocial}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Título de la Oferta</label>
                    <input type="text" value={editForm.titulo} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Descripción y Funciones</label>
                    <textarea rows={5} value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} required></textarea>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Ubicación (Ciudad)</label>
                      <input type="text" value={editForm.ubicacion} onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Modalidad</label>
                      <select value={editForm.modalidad} onChange={(e) => setEditForm({ ...editForm, modalidad: e.target.value })}>
                        {modalidades.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Tipo Contrato</label>
                      <select value={editForm.tipoContrato} onChange={(e) => setEditForm({ ...editForm, tipoContrato: e.target.value })}>
                        {tiposContrato.map(tc => <option key={tc.value} value={tc.value}>{tc.label}</option>)}
                      </select>
                    </div>
                    {(userRole === 'admin' || userRole === 'empresa') && (
                      <div className="form-group">
                        <label>Fecha de inicio (inicio postulaciones)</label>
                        <input type="date" value={editForm.fechaPublicacion} onChange={(e) => setEditForm({ ...editForm, fechaPublicacion: e.target.value })} />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Fecha final</label>
                      <input type="date" value={editForm.fechaCierre} onChange={(e) => setEditForm({ ...editForm, fechaCierre: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Salario Mínimo (Opcional)</label>
                      <input type="number" value={editForm.salarioMin} onChange={(e) => setEditForm({ ...editForm, salarioMin: parseInt(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label>Salario Máximo (Opcional)</label>
                      <input type="number" value={editForm.salarioMax} onChange={(e) => setEditForm({ ...editForm, salarioMax: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Habilidades Requeridas</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {editForm.habilidadesIds?.map((hId: string) => (
                        <span key={hId} className="badge badge-primary">
                          {availableSkills.find(as => as.id === hId)?.nombre}
                          <button type="button" onClick={() => setEditForm({...editForm, habilidadesIds: editForm.habilidadesIds.filter((id: string) => id !== hId)})} style={{ marginLeft: '4px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                        </span>
                      ))}
                    </div>
                    <select onChange={(e) => { if (e.target.value) setEditForm({...editForm, habilidadesIds: [...(editForm.habilidadesIds || []), e.target.value]}) }}>
                      <option value="">+ Añadir Habilidad</option>
                      {availableSkills.filter(as => !editForm.habilidadesIds?.includes(as.id)).map(as => <option key={as.id} value={as.id}>{as.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => saveOferta('Borrador')}>Guardar como Borrador</button>
                    <button type="submit" className="btn btn-primary">Publicar Oferta</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
    </main>
  );
}
