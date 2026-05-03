'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPage() {
  const { isLoggedIn, userRole, userId, loading: authLoading } = useAuth();
  const router = useRouter();

  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaHabilidad, setNuevaHabilidad] = useState({ nombre: '', tipo: 'Técnica', categoria: 'General' });
  const [editingHabilidad, setEditingHabilidad] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState({ actual: false, nueva: false, confirmar: false });
  const [config, setConfig] = useState({
    logoUrl: '/logo.png',
    nombreInstitucion: 'Universidad Nacional Mayor de San Marcos',
    colorPrimario: '#0066cc',
    terminosCondiciones: 'Los términos y condiciones del sistema...'
  });

  const [seguridad, setSeguridad] = useState({ actual: '', nueva: '', confirmar: '' });

  const fetchHabilidades = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/habilidades`);
      if (response.ok) {
        const data = await response.json();
        setHabilidades(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
    if (userRole === 'admin') fetchHabilidades();
  }, [isLoggedIn, authLoading, userRole]);

  const handleAddHabilidad = async () => {
    if (!nuevaHabilidad.nombre) {
      alert('Por favor, ingrese un nombre para la habilidad');
      return;
    }
    
    setLoading(true);
    try {
      const method = editingHabilidad ? 'PUT' : 'POST';
      const url = editingHabilidad 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/habilidades/${editingHabilidad.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/habilidades`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaHabilidad),
      });
      
      if (response.ok) {
        alert(editingHabilidad ? '✅ Habilidad actualizada' : '✅ Habilidad agregada correctamente');
        setNuevaHabilidad({ nombre: '', tipo: 'Técnica', categoria: 'General' });
        setEditingHabilidad(null);
        await fetchHabilidades();
      } else {
        const errorData = await response.json();
        alert(`❌ Error al guardar habilidad: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHabilidad = (h: any) => {
    setEditingHabilidad(h);
    setNuevaHabilidad({
      nombre: h.nombre,
      tipo: h.tipo.charAt(0).toUpperCase() + h.tipo.slice(1),
      categoria: h.categoria || 'General'
    });
  };

  const handleDeleteHabilidad = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta habilidad?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'}/habilidades/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Habilidad eliminada');
        fetchHabilidades();
      }
    } catch (error) {
      alert('Error al eliminar habilidad');
    }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      // Simulación de guardado de configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Configuración institucional actualizada correctamente');
    } catch (error) {
      alert('❌ Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!seguridad.actual || !seguridad.nueva || !seguridad.confirmar) {
      alert('⚠️ Por favor complete todos los campos');
      return;
    }
    if (seguridad.nueva !== seguridad.confirmar) {
      alert('⚠️ La nueva contraseña y su confirmación no coinciden');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          actual: seguridad.actual,
          nueva: seguridad.nueva,
        }),
      });

      if (response.ok) {
        alert('✅ Contraseña actualizada correctamente');
        setSeguridad({ actual: '', nueva: '', confirmar: '' });
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.message || 'La contraseña actual es incorrecta'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="page-header">
          <h1>⚙️ Configuración y Seguridad</h1>
          <p>{userRole === 'admin' ? 'Gestione los parámetros del sistema y su seguridad' : 'Gestione su seguridad y preferencias'}</p>
        </div>

        <div className="grid-2">
          {userRole === 'admin' && (
            <>
              {/* Gestión de Habilidades */}
              <div className="card">
                <h2>🛠️ Gestión de Habilidades</h2>
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label>Nombre de la Habilidad</label>
                    <input 
                      type="text" 
                      value={nuevaHabilidad.nombre} 
                      onChange={(e) => setNuevaHabilidad({...nuevaHabilidad, nombre: e.target.value})} 
                      placeholder="Ej: React Native, Liderazgo..."
                    />
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Tipo</label>
                      <select value={nuevaHabilidad.tipo} onChange={(e) => setNuevaHabilidad({...nuevaHabilidad, tipo: e.target.value})}>
                        <option value="Técnica">Técnica</option>
                        <option value="Blanda">Blanda</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select value={nuevaHabilidad.categoria} onChange={(e) => setNuevaHabilidad({...nuevaHabilidad, categoria: e.target.value})}>
                        <option value="General">General</option>
                        <option value="Programación">Programación</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Diseño">Diseño</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddHabilidad}>
                      {editingHabilidad ? 'Actualizar Habilidad' : 'Agregar Habilidad'}
                    </button>
                    {editingHabilidad && (
                      <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setEditingHabilidad(null); setNuevaHabilidad({ nombre: '', tipo: 'Técnica', categoria: 'General' }); }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <h3>Habilidades Existentes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {habilidades.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                        <span>{h.nombre} <small style={{ color: '#666' }}>({h.tipo})</small></span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn btn-secondary btn-small" 
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleEditHabilidad(h)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-danger btn-small" 
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleDeleteHabilidad(h.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configuración General */}
              <div className="card">
                <h2>🎨 Configuración General</h2>
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label>Nombre de la Institución</label>
                    <input 
                      type="text" 
                      value={config.nombreInstitucion} 
                      onChange={(e) => setConfig({...config, nombreInstitucion: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>URL del Logo Institucional</label>
                    <input 
                      type="text" 
                      value={config.logoUrl} 
                      onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Color Primario (Hex)</label>
                    <input 
                      type="color" 
                      value={config.colorPrimario} 
                      onChange={(e) => setConfig({...config, colorPrimario: e.target.value})}
                      style={{ height: '40px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Términos y Condiciones</label>
                    <textarea 
                      rows={6} 
                      value={config.terminosCondiciones} 
                      onChange={(e) => setConfig({...config, terminosCondiciones: e.target.value})}
                    ></textarea>
                  </div>
                  <button className="btn btn-success" style={{ width: '100%' }} onClick={handleUpdateConfig}>Guardar Configuración Global</button>
                </div>
              </div>
            </>
          )}

          {/* Seguridad (Para todos los roles) */}
          <div className="card" style={{ gridColumn: userRole !== 'admin' ? '1 / span 2' : 'auto' }}>
            <h2>🔐 Seguridad</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Actualice su contraseña periódicamente para mantener su cuenta segura.</p>
            <div style={{ marginTop: '20px', maxWidth: userRole !== 'admin' ? '500px' : 'none' }}>
              <div className="form-group">
                <label>Contraseña Actual</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.actual ? 'text' : 'password'} 
                    value={seguridad.actual} 
                    onChange={(e) => setSeguridad({...seguridad, actual: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, actual: !showPasswords.actual})}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPasswords.actual ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.nueva ? 'text' : 'password'} 
                    value={seguridad.nueva} 
                    onChange={(e) => setSeguridad({...seguridad, nueva: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, nueva: !showPasswords.nueva})}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPasswords.nueva ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.confirmar ? 'text' : 'password'} 
                    value={seguridad.confirmar} 
                    onChange={(e) => setSeguridad({...seguridad, confirmar: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirmar: !showPasswords.confirmar})}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPasswords.confirmar ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleChangePassword}>Actualizar Contraseña</button>
            </div>
          </div>
        </div>
    </main>
  );
}
