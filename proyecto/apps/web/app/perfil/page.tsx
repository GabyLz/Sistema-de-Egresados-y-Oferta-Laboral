'use client';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;

export default function PerfilPage() {
  const { isLoggedIn, userRole, userId, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  const [perfil, setPerfil] = useState<any>(null);
  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({ 
    nombres: '', 
    apellidos: '', 
    carrera: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    anioEgreso: '',
    // Campos empresa
    razonSocial: '',
    nombreComercial: '',
    sector: '',
    sitioWeb: '',
    descripcion: '',
    redesSociales: { linkedin: '', facebook: '', twitter: '' }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [cvLink, setCvLink] = useState('');
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Modales
  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<{ type: 'edu' | 'exp', id: string } | null>(null);
  const [eduForm, setEduForm] = useState({ id: '', institucion: '', titulo: '', fechaInicio: '', fechaFin: '' });
  const [expForm, setExpForm] = useState({ id: '', empresa: '', cargo: '', fechaInicio: '', fechaFin: '', descripcion: '' });

  const canViewProfile = !authLoading && isLoggedIn && (userRole === 'egresado' || userRole === 'empresa');

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    // Usar el formato local para mostrar, pero para inputs necesitamos YYYY-MM-DD
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const fetchData = async () => {
    if (!userId) return;
    setFetching(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (userRole === 'egresado') {
        const [perfilRes, habRes] = await Promise.all([
          fetch(`${baseUrl}/egresados/perfil/${userId}`),
          fetch(`${baseUrl}/habilidades`)
        ]);
        
        if (!perfilRes.ok) throw new Error('No se pudo cargar el perfil');
        if (!habRes.ok) throw new Error('No se pudo cargar la lista de habilidades');

        const data = await perfilRes.json();
        setPerfil(data);
        setCvLink(data.cvUrl || '');
        setFormData({ 
          nombres: data.nombres || '', 
          apellidos: data.apellidos || '', 
          carrera: data.carrera || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '',
          anioEgreso: data.anioEgreso || '',
          razonSocial: '', 
          nombreComercial: '', 
          sector: '', 
          sitioWeb: '', 
          descripcion: '', 
          redesSociales: { linkedin: '', facebook: '', twitter: '' }
        });
        const habData = await habRes.json();
        setHabilidades(habData);
      } else if (userRole === 'empresa') {
        const res = await fetch(`${baseUrl}/empresas/${userId}`);
        if (!res.ok) throw new Error('No se pudo cargar el perfil de empresa');
        const data = await res.json();
        setPerfil(data);
        setFormData({
          nombres: '', apellidos: '', carrera: '', fechaNacimiento: '', anioEgreso: '',
          razonSocial: data.razonSocial || '',
          nombreComercial: data.nombreComercial || '',
          sector: data.sector || '',
          sitioWeb: data.sitioWeb || '',
          descripcion: data.descripcion || '',
          telefono: data.telefono || '',
          direccion: data.ubicacion || '',
          redesSociales: data.redesSociales || { linkedin: '', facebook: '', twitter: '' }
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      setError(error.message || 'Error al cargar los datos');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId && userRole) {
      fetchData();
    }
  }, [isLoggedIn, userId, userRole]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes');
        return;
      }
      setLogoFile(file);
    }
  };

  const saveEducacion = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const method = eduForm.id ? 'PUT' : 'POST';
      const url = eduForm.id ? `${baseUrl}/egresados/educacion/${eduForm.id}` : `${baseUrl}/egresados/educacion`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eduForm, egresadoId: userId }),
      });
      if (!res.ok) throw new Error('Error al guardar formación');
      
      setShowEduModal(false);
      setEduForm({ id: '', institucion: '', titulo: '', fechaInicio: '', fechaFin: '' });
      setSuccess('Formación guardada correctamente');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Error al guardar formación');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteEducacion = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/egresados/educacion/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar formación');
      
      setSuccess('Formación eliminada correctamente');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (e: any) { 
      setError(e.message || 'Error al eliminar formación'); 
      setTimeout(() => setError(null), 3000);
    }
    setShowConfirmDelete(null);
  };

  const saveExperiencia = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const method = expForm.id ? 'PUT' : 'POST';
      const url = expForm.id ? `${baseUrl}/egresados/experiencia/${expForm.id}` : `${baseUrl}/egresados/experiencia`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expForm, egresadoId: userId }),
      });
      if (!res.ok) throw new Error('Error al guardar experiencia');

      setShowExpModal(false);
      setExpForm({ id: '', empresa: '', cargo: '', fechaInicio: '', fechaFin: '', descripcion: '' });
      setSuccess('Experiencia guardada correctamente');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Error al guardar experiencia');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperiencia = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/egresados/experiencia/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar experiencia');

      setSuccess('Experiencia eliminada correctamente');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (e: any) { 
      setError(e.message || 'Error al eliminar experiencia'); 
      setTimeout(() => setError(null), 3000);
    }
    setShowConfirmDelete(null);
  };

  const submitProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (userRole === 'egresado') {
        const updateRes = await fetch(`${baseUrl}/egresados/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            carrera: formData.carrera,
            telefono: formData.telefono,
            direccion: formData.direccion,
            fechaNacimiento: formData.fechaNacimiento,
            anioEgreso: formData.anioEgreso,
            cvUrl: cvLink 
          }),
        });
        if (!updateRes.ok) throw new Error('Error al actualizar perfil profesional');
        
      } else if (userRole === 'empresa') {
        const updateRes = await fetch(`${baseUrl}/empresas/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razonSocial: formData.razonSocial,
            nombreComercial: formData.nombreComercial,
            sector: formData.sector,
            sitioWeb: formData.sitioWeb,
            descripcion: formData.descripcion,
            telefono: formData.telefono,
            ubicacion: formData.direccion,
            redesSociales: formData.redesSociales
          }),
        });
        if (!updateRes.ok) throw new Error('Error al actualizar empresa');

        if (logoFile) {
          const fileData = new FormData();
          fileData.append('file', logoFile);
          fileData.append('empresaId', userId);
          const uploadRes = await fetch(`${baseUrl}/empresas/logo/upload`, { method: 'POST', body: fileData });
          if (!uploadRes.ok) throw new Error('Error al subir logo');
        }
      }

      setSuccess('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccess(null), 3000);
      setShowProfileModal(false);
      await fetchData();
    } catch (error: any) {
      setError(error.message || 'Error al guardar cambios');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addHabilidad = async () => {
    if (!nuevaHabilidad || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Buscar si la habilidad ya existe
      const habsRes = await fetch(`${baseUrl}/habilidades`);
      if (!habsRes.ok) throw new Error('Error al cargar habilidades');
      const habs = await habsRes.json();
      let hab = habs.find((h: any) => h.nombre.toLowerCase() === nuevaHabilidad.toLowerCase());

      if (!hab) {
        // Crear si no existe
        const createRes = await fetch(`${baseUrl}/habilidades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nuevaHabilidad, tipo: 'tecnica' }),
        });
        if (!createRes.ok) throw new Error('Error al crear nueva habilidad');
        hab = await createRes.json();
      }

      // Vincular al egresado (Nivel 3 = Intermedio por defecto)
      const linkRes = await fetch(`${baseUrl}/habilidades/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ egresadoId: userId, habilidadId: hab.id, nivel: 3 }),
      });

      if (!linkRes.ok) throw new Error('Error al vincular habilidad');
      
      setSuccess('Habilidad añadida correctamente');
      setTimeout(() => setSuccess(null), 3000);
      setNuevaHabilidad('');
      await fetchData();
    } catch (error: any) {
      setError(error.message || 'Error al procesar habilidad');
    } finally {
      setLoading(false);
    }
  };

  const removeHabilidad = async (habilidadId: string) => {
    if (!userId) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/habilidades/egresado/${userId}/${habilidadId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar habilidad');
      setSuccess('Habilidad eliminada correctamente');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (e: any) { 
      setError(e.message); 
      setTimeout(() => setError(null), 3000);
    }
  };

  const isProfileIncomplete = userRole === 'empresa' && perfil && (
    !perfil.descripcion || !perfil.logoUrl || !perfil.sitioWeb || !perfil.sector
  );

  if (!authLoading && isLoggedIn && !canViewProfile) {
    return (
      <main className="page-shell">
        <div className="card">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para ver esta sección.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{userRole === 'egresado' ? '👤 Mi Perfil Profesional' : '🏢 Mi Empresa'}</h1>
            <p>{userRole === 'egresado' ? 'Gestiona tu información personal, académica y laboral' : 'Gestiona la información pública de tu organización'}</p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setError(null);
            setShowProfileModal(true);
          }}>
            ✏️ Editar Perfil
          </button>
        </div>

        {isProfileIncomplete && (
          <div className="alert alert-warning" style={{ marginBottom: '24px', padding: '16px', background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', borderRadius: '8px' }}>
            <strong>📢 Perfil Incompleto:</strong> Para una mejor visibilidad, completa la descripción, logo, sitio web y sector industrial.
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '24px', padding: '16px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1200 }}>
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#155724', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '24px', padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1200 }}>
            <span>❌ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#721c24', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {fetching ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {userRole === 'egresado' ? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <h2>Datos Personales</h2>
                    <div style={{ marginTop: '16px' }}>
                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Nombres</label>
                          <p className="form-control-plaintext">{formData.nombres}</p>
                        </div>
                        <div className="form-group">
                          <label>Apellidos</label>
                          <p className="form-control-plaintext">{formData.apellidos}</p>
                        </div>
                      </div>
                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Teléfono</label>
                          <p className="form-control-plaintext">{formData.telefono}</p>
                        </div>
                        <div className="form-group">
                          <label>Fecha de Nacimiento</label>
                          <p className="form-control-plaintext">{formatDate(perfil?.fechaNacimiento)}</p>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Dirección</label>
                        <p className="form-control-plaintext">{formData.direccion}</p>
                      </div>
                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Carrera</label>
                          <p className="form-control-plaintext">{formData.carrera}</p>
                        </div>
                        <div className="form-group">
                          <label>Año de Egreso</label>
                          <p className="form-control-plaintext">{formData.anioEgreso}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h2>Currículum Vitae</h2>
                    <div style={{ marginTop: '16px', textAlign: 'center', padding: '24px', border: '2px dashed var(--border)', borderRadius: '12px', background: 'var(--secondary)' }}>
                      <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
                        <IconFileText />
                      </div>
                      
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>
                          {perfil?.cvUrl ? 'Currículum vinculado' : 'No se ha configurado un enlace a CV'}
                        </p>
                      </div>

                      {perfil?.cvUrl && (
                        <div style={{ marginTop: '16px' }}>
                          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Acceso rápido:</p>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <a href={perfil.cvUrl} target="_blank" className="btn btn-secondary btn-small">👁️ Ver Currículum Externo</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '24px' }}>
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2>Formación Académica</h2>
                      <button className="btn btn-secondary btn-small" onClick={() => { setEduForm({ id: '', institucion: '', titulo: '', fechaInicio: '', fechaFin: '' }); setShowEduModal(true); }}>+ Agregar</button>
                    </div>
                    {perfil?.formacionesAcademicas?.map((f: any, i: number) => (
                      <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>{f.titulo}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>{f.institucion}</p>
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(f.fechaInicio).toLocaleDateString()} - {f.fechaFin ? new Date(f.fechaFin).toLocaleDateString() : 'Presente'}</p>
                          </div>
                          <div className="btn-group">
                            <button className="btn btn-secondary btn-small" onClick={() => { setEduForm({ ...f, fechaInicio: f.fechaInicio.split('T')[0], fechaFin: f.fechaFin ? f.fechaFin.split('T')[0] : '' }); setShowEduModal(true); }}>✏️</button>
                            <button className="btn btn-danger btn-small" onClick={() => setShowConfirmDelete({ type: 'edu', id: f.id })}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    )) || <p style={{ color: '#888' }}>No has registrado estudios.</p>}
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2>Experiencia Laboral</h2>
                      <button className="btn btn-secondary btn-small" onClick={() => { setExpForm({ id: '', empresa: '', cargo: '', fechaInicio: '', fechaFin: '', descripcion: '' }); setShowExpModal(true); }}>+ Agregar</button>
                    </div>
                    {perfil?.experienciasLaborales?.map((e: any, i: number) => (
                      <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>{e.cargo} en {e.empresa}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>{new Date(e.fechaInicio).toLocaleDateString()} - {e.fechaFin ? new Date(e.fechaFin).toLocaleDateString() : 'Presente'}</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{e.descripcion}</p>
                          </div>
                          <div className="btn-group">
                            <button className="btn btn-secondary btn-small" onClick={() => { setExpForm({ ...e, fechaInicio: e.fechaInicio.split('T')[0], fechaFin: e.fechaFin ? e.fechaFin.split('T')[0] : '' }); setShowExpModal(true); }}>✏️</button>
                            <button className="btn btn-danger btn-small" onClick={() => setShowConfirmDelete({ type: 'exp', id: e.id })}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    )) || <p style={{ color: '#888' }}>Sin experiencia previa.</p>}
                  </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                  <h2>Habilidades</h2>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '16px' }}>
                    {perfil?.egresadoHabilidades?.length > 0 ? (
                      perfil.egresadoHabilidades.map((h: any, i: number) => (
                        <span key={i} className="user-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {h.habilidad?.nombre}
                          <button 
                            onClick={() => removeHabilidad(h.habilidadId)} 
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 'bold' }}
                            title="Eliminar habilidad"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <p style={{ color: '#888', fontStyle: 'italic' }}>No has registrado habilidades.</p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px', display: 'block' }}>Buscar o añadir nueva habilidad</label>
                      <input 
                        type="text" 
                        list="skills-list"
                        placeholder="Ej. React, Java, Liderazgo..." 
                        value={nuevaHabilidad}
                        onChange={(e) => setNuevaHabilidad(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                      />
                      <datalist id="skills-list">
                        {habilidades.map((h: any) => (
                          <option key={h.id} value={h.nombre} />
                        ))}
                      </datalist>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={addHabilidad}>
                      ➕ Añadir
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* VISTA EMPRESA */
              <div className="grid-2">
                <div className="card">
                  <h2>Información Corporativa</h2>
                  <div style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <label>Razón Social</label>
                      <p className="form-control-plaintext">{formData.razonSocial}</p>
                    </div>
                    <div className="form-group">
                      <label>Nombre Comercial</label>
                      <p className="form-control-plaintext">{formData.nombreComercial}</p>
                    </div>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Sector Industrial</label>
                        <p className="form-control-plaintext">{formData.sector}</p>
                      </div>
                      <div className="form-group">
                        <label>Sitio Web</label>
                        <p className="form-control-plaintext">{formData.sitioWeb}</p>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Descripción Detallada</label>
                      <p className="form-control-plaintext" style={{ whiteSpace: 'pre-wrap' }}>{formData.descripcion}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2>Logo y Redes Sociales</h2>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      {perfil?.logoUrl || logoFile ? (
                        <img 
                          src={logoFile ? URL.createObjectURL(logoFile) : perfil.logoUrl} 
                          alt="Logo empresa" 
                          style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                        />
                      ) : (
                        <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: '#eee', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                          Sin Logo
                        </div>
                      )}
                    </div>

                    <h3>Redes Sociales</h3>
                    <div style={{ marginTop: '12px' }}>
                      <div className="form-group">
                        <label>LinkedIn</label>
                        <p className="form-control-plaintext">{formData.redesSociales.linkedin || '-'}</p>
                      </div>
                      <div className="form-group">
                        <label>Facebook</label>
                        <p className="form-control-plaintext">{formData.redesSociales.facebook || '-'}</p>
                      </div>
                      <div className="form-group">
                        <label>Twitter / X</label>
                        <p className="form-control-plaintext">{formData.redesSociales.twitter || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showConfirmDelete && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px', textAlign: 'center' }}>
              <h3>⚠️ Confirmar Eliminación</h3>
              <p style={{ margin: '16px 0', color: '#64748b' }}>
                ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowConfirmDelete(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => {
                  if (showConfirmDelete.type === 'edu') deleteEducacion(showConfirmDelete.id);
                  else deleteExperiencia(showConfirmDelete.id);
                }}>Eliminar Definitivamente</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Formación */}
        {showEduModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '20px' }}>
              <h3>Añadir Formación Académica</h3>
              <div style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>Institución</label>
                  <input type="text" value={eduForm.institucion} onChange={(e) => setEduForm({...eduForm, institucion: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Título / Grado</label>
                  <input type="text" value={eduForm.titulo} onChange={(e) => setEduForm({...eduForm, titulo: e.target.value})} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" value={eduForm.fechaInicio} onChange={(e) => setEduForm({...eduForm, fechaInicio: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin (vacío si es presente)</label>
                    <input type="date" value={eduForm.fechaFin} onChange={(e) => setEduForm({...eduForm, fechaFin: e.target.value})} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowEduModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={saveEducacion}>{eduForm.id ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Experiencia */}
        {showExpModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '20px' }}>
              <h3>Añadir Experiencia Laboral</h3>
              <div style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>Empresa</label>
                  <input type="text" value={expForm.empresa} onChange={(e) => setExpForm({...expForm, empresa: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input type="text" value={expForm.cargo} onChange={(e) => setExpForm({...expForm, cargo: e.target.value})} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" value={expForm.fechaInicio} onChange={(e) => setExpForm({...expForm, fechaInicio: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin</label>
                    <input type="date" value={expForm.fechaFin} onChange={(e) => setExpForm({...expForm, fechaFin: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea rows={3} value={expForm.descripcion} onChange={(e) => setExpForm({...expForm, descripcion: e.target.value})}></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowExpModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={saveExperiencia}>{expForm.id ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Perfil */}
        {showProfileModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', margin: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>{userRole === 'egresado' ? 'Editar Perfil Profesional' : 'Editar Información de Empresa'}</h3>
                <button className="btn btn-secondary btn-small" onClick={() => setShowProfileModal(false)}>✕</button>
              </div>
              
              <div className="modal-body">
                {userRole === 'egresado' ? (
                  <div className="grid-2">
                    <div>
                      <div className="form-group">
                        <label>Nombres</label>
                        <input type="text" className="form-control" value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Apellidos</label>
                        <input type="text" className="form-control" value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Carrera</label>
                        <input type="text" className="form-control" value={formData.carrera} onChange={(e) => setFormData({...formData, carrera: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input type="text" className="form-control" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" className="form-control" value={formData.fechaNacimiento} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Año de Egreso</label>
                        <input type="number" className="form-control" value={formData.anioEgreso} onChange={(e) => setFormData({...formData, anioEgreso: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Dirección</label>
                        <input type="text" className="form-control" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Enlace a Currículum Vitae (Google Drive, LinkedIn, etc.)</label>
                      <input type="url" className="form-control" placeholder="https://drive.google.com/..." value={cvLink} onChange={(e) => setCvLink(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="grid-2">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Razón Social</label>
                      <input type="text" className="form-control" value={formData.razonSocial} onChange={(e) => setFormData({...formData, razonSocial: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Sector</label>
                      <input type="text" className="form-control" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Sitio Web</label>
                      <input type="url" className="form-control" value={formData.sitioWeb} onChange={(e) => setFormData({...formData, sitioWeb: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Descripción</label>
                      <textarea className="form-control" rows={4} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Logo de Empresa</label>
                      <input type="file" className="form-control" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={async () => {
                  await submitProfile();
                  setShowProfileModal(false);
                }} disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
