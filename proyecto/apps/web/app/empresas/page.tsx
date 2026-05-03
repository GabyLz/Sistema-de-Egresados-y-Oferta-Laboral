'use client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa {
  id: string;
  razonSocial: string;
  nombreComercial?: string;
  rut: string;
  telefono?: string;
  sector?: string;
  ubicacion?: string;
  sitioWeb?: string;
  descripcion?: string;
  logoUrl?: string;
  estado: 'Aprobada' | 'Pendiente' | 'Rechazada';
  user?: {
    email: string;
  };
}

export default function EmpresasPage() {
  const { isLoggedIn, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [targetEmpresaId, setTargetEmpresaId] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/empresas`);
      if (response.ok) {
        const data: Empresa[] = await response.json();
        // Ordenar por razón social para evitar que las filas salten al actualizar
        const sorted = data.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
        setEmpresas(sorted);
      }
    } catch (error) {
      setError('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') fetchEmpresas();
  }, [userRole]);

  const handleUpdateStatus = async (id: string, estado: string) => {
    if (estado === 'Rechazada' && !showRejectionInput) {
      setTargetEmpresaId(id);
      setShowRejectionInput(true);
      return;
    }

    setProcessingId(id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/empresas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, motivo: rejectionReason }),
      });
      if (response.ok) {
        setSuccess(`Empresa marcada como ${estado} correctamente`);
        setTimeout(() => setSuccess(null), 3000);
        setShowRejectionInput(false);
        setRejectionReason('');
        await fetchEmpresas();
      } else {
        throw new Error('Error al actualizar estado');
      }
    } catch (err) {
      setError('Error al actualizar estado de la empresa');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/empresas/${empresaToDelete.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('Empresa eliminada correctamente');
        setTimeout(() => setSuccess(null), 3000);
        setShowDeleteModal(false);
        setEmpresaToDelete(null);
        fetchEmpresas();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (err) {
      setError('No se pudo eliminar la empresa');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (userRole !== 'admin') {
    return (
      <main className="page-shell">
        <div className="card">
          <h1>Acceso Denegado</h1>
          <p>Esta página es solo para administradores.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell management-page">
      <div className="page-header" style={{ marginTop: '20px' }}>
          <h1>🏢 Gestión de Empresas</h1>
          <p>Valida y gestiona las empresas registradas en el sistema</p>
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

        {showRejectionInput && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
              <h3>Motivo de Rechazo</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>Por favor, indique la razón por la cual se está rechazando esta empresa.</p>
              <textarea 
                className="form-control" 
                rows={4} 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Documentación incompleta, RUC no válido..."
                style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowRejectionInput(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleUpdateStatus(targetEmpresaId, 'Rechazada')} disabled={!rejectionReason}>Confirmar Rechazo</button>
              </div>
            </div>
          </div>
        )}

        <div className="card management-card">
          <div className="table-container management-table">
            <table>
              <thead>
                <tr>
                  <th>Razón Social</th>
                  <th>RUC / RUT</th>
                  <th>Sector</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.razonSocial}</td>
                    <td>{empresa.rut}</td>
                    <td>{empresa.sector || 'No especificado'}</td>
                    <td>
                      <span className={`badge ${
                        empresa.estado === 'Aprobada' ? 'badge-success' : 
                        empresa.estado === 'Pendiente' ? 'badge-warning' : 'badge-error'
                      }`} style={{ color: '#0f172a' }}>
                        {empresa.estado === 'Aprobada' ? 'Aprobada' : 
                         empresa.estado === 'Pendiente' ? 'Pendiente' : 'Rechazada'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group management-actions">
                        <button 
                          className="btn btn-small btn-view"
                          style={{ backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8' }}
                          onClick={() => { setSelectedEmpresa(empresa); setShowModal(true); }}
                          disabled={!!processingId}
                        >
                          Ver
                        </button>
                        {empresa.estado === 'Pendiente' && (
                          <>
                            <button 
                              className="btn btn-small btn-approve"
                              style={{ backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#15803d' }}
                              onClick={() => handleUpdateStatus(empresa.id, 'Aprobada')}
                              disabled={processingId === empresa.id}
                            >
                              {processingId === empresa.id ? '...' : 'Validar'}
                            </button>
                            <button 
                              className="btn btn-small btn-reject"
                              style={{ backgroundColor: '#ea580c', color: '#ffffff', borderColor: '#c2410c' }}
                              onClick={() => handleUpdateStatus(empresa.id, 'Rechazada')}
                              disabled={processingId === empresa.id}
                            >
                              {processingId === empresa.id ? '...' : 'Rechazar'}
                            </button>
                          </>
                        )}
                        {userRole === 'admin' && empresa.estado !== 'Pendiente' && (
                          <button 
                            className="btn btn-small btn-revert"
                            style={{ backgroundColor: '#8b5cf6', color: '#ffffff', borderColor: '#7c3aed' }}
                            onClick={() => handleUpdateStatus(empresa.id, 'Pendiente')}
                            disabled={processingId === empresa.id}
                          >
                            {processingId === empresa.id ? '...' : 'Revertir a Pendiente'}
                          </button>
                        )}
                        <button 
                          className="btn btn-small btn-delete"
                          style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#b91c1c' }}
                          onClick={() => { setEmpresaToDelete(empresa); setShowDeleteModal(true); }}
                          disabled={!!processingId}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card management-modal" style={{ maxWidth: '400px', width: '100%', margin: '20px', padding: '0' }}>
              <div className="card-header">
                <h2 style={{ margin: 0 }}>⚠️ Confirmar Eliminación</h2>
              </div>
              <div style={{ padding: '20px 22px' }}>
              <p>¿Estás seguro de que deseas eliminar la empresa <strong>{empresaToDelete?.razonSocial}</strong>?</p>
              <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '8px' }}>Esta acción eliminará también la cuenta de usuario asociada.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setEmpresaToDelete(null); }}>Cancelar</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Eliminar Empresa</button>
              </div>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedEmpresa && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card management-modal" style={{ maxWidth: '600px', width: '100%', margin: '20px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 11 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🏢 Detalle de Empresa</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-small">X</button>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Razón Social</p>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedEmpresa.razonSocial}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>RUC / RUT</p>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedEmpresa.rut}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Sector</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmpresa.sector || 'General'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Estado</p>
                    <span className={`badge ${
                      selectedEmpresa.estado === 'Aprobada' ? 'badge-success' : 
                      selectedEmpresa.estado === 'Pendiente' ? 'badge-warning' : 'badge-error'
                    }`} style={{ color: '#0f172a' }}>
                      {selectedEmpresa.estado === 'Aprobada' ? '🟢 Aprobada' : 
                       selectedEmpresa.estado === 'Pendiente' ? '🟡 Pendiente' : '🔴 Rechazada'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <section>
                    <h3 style={{ fontSize: '1rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>📍 Contacto</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      <p><strong>Ubicación:</strong> {selectedEmpresa.ubicacion || 'No especificada'}</p>
                      <p><strong>Email:</strong> {selectedEmpresa.user?.email || 'N/A'}</p>
                      <p><strong>Teléfono:</strong> {selectedEmpresa.telefono || 'N/A'}</p>
                      {selectedEmpresa.sitioWeb && (
                        <p><strong>Web:</strong> <a href={selectedEmpresa.sitioWeb} target="_blank" style={{ color: 'var(--accent)' }}>{selectedEmpresa.sitioWeb}</a></p>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 style={{ fontSize: '1rem', color: 'var(--accent)', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>📝 Descripción</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#444' }}>
                      {selectedEmpresa.descripcion || 'Empresa registrada en el sistema SEGO.'}
                    </p>
                  </section>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                {selectedEmpresa.estado === 'Pendiente' && (
                  <>
                    <button className="btn btn-danger" onClick={() => handleUpdateStatus(selectedEmpresa.id, 'Rechazada')}>Rechazar</button>
                    <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedEmpresa.id, 'Aprobada')}>Validar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
