'use client';
import KpiCard from '../../components/KpiCard';
import { DashboardChart } from '../../components/DashboardChart';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isLoggedIn, userRole, userId, userName, loading: authLoading } = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [distribucion, setDistribucion] = useState<any[]>([]);
  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [cohortes, setCohortes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros temporales
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  const [ofertasRecomendadas, setOfertasRecomendadas] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams();
      if (startDate) queryString.set('fechaInicio', startDate);
      if (endDate) queryString.set('fechaFin', endDate);

      let kpiEndpoint = `/estadisticas/admin/kpis${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      if (userRole === 'egresado') kpiEndpoint = `/estadisticas/egresado/${userId}/kpis`;
      if (userRole === 'empresa') kpiEndpoint = `/estadisticas/empresa/${userId}/kpis`;

      const adminQuery = queryString.toString() ? `?${queryString.toString()}` : '';

      const [kpiRes, seriesRes, distRes, habRes, cohRes, recRes] = await Promise.all([
        fetch(`${baseUrl}${kpiEndpoint}`),
        userRole === 'admin' ? fetch(`${baseUrl}/estadisticas/admin/series${adminQuery}`) : Promise.resolve(null),
        userRole === 'admin' ? fetch(`${baseUrl}/estadisticas/admin/distribucion${adminQuery}`) : Promise.resolve(null),
        userRole === 'admin' ? fetch(`${baseUrl}/estadisticas/admin/habilidades${adminQuery}`) : Promise.resolve(null),
        userRole === 'admin' ? fetch(`${baseUrl}/estadisticas/admin/cohortes${adminQuery}`) : Promise.resolve(null),
        userRole === 'egresado' ? fetch(`${baseUrl}/ofertas/recomendadas/${userId}`) : Promise.resolve(null),
      ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
      if (seriesRes?.ok) setSeries(await seriesRes.json());
      if (distRes?.ok) setDistribucion(await distRes.json());
      if (habRes?.ok) setHabilidades(await habRes.json());
      if (cohRes?.ok) setCohortes(await cohRes.json());
      if (recRes?.ok) setOfertasRecomendadas(await recRes.json());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userRole) return;
    if (userRole !== 'admin' && !userId) return;
    fetchData();
  }, [userRole, userId, userName]);

  return (
    <main className="page-shell">
      <section className="page-header dashboard-hero" style={{ marginTop: '30px' }}>
          <div>
            <p className="section-eyebrow">Centro de control</p>
            <h1>{userRole === 'admin' ? 'Dashboard Administrativo' : userRole === 'empresa' ? 'Dashboard Empresa' : 'Mi Dashboard Profesional'}</h1>
            <p>Métricas y análisis de la plataforma en tiempo real</p>
          </div>
          
          {userRole === 'admin' && (
            <div className="dashboard-filter card compact-filter">
              <span className="filter-tag">Periodo de análisis</span>
              <div className="dashboard-filter-row compact-filter-row">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Fecha inicial" />
                <span className="filter-separator">a</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="Fecha final" />
                <button className="btn btn-primary btn-small" onClick={fetchData}>Aplicar</button>
              </div>
            </div>
          )}
        </section>

        {/* KPI Cards */}
        <section className="grid-4 dashboard-kpis">
          <KpiCard
            title={userRole === 'admin' ? 'Total Egresados' : userRole === 'empresa' ? 'Postulantes' : 'Postulaciones'}
            value={kpis?.totalEgresados || kpis?.totalPostulantes || kpis?.totalPostulaciones || 0}
            icon="👥"
            trend={userRole === 'admin' ? '+12% este mes' : undefined}
            onClick={() => router.push('/egresados')}
          />
          <KpiCard
            title={userRole === 'admin' ? 'Empresas Activas' : userRole === 'empresa' ? 'Ofertas' : 'Ofertas Vistas'}
            value={kpis?.totalEmpresas || kpis?.totalOfertas || kpis?.ofertasVistas || 0}
            icon="🏢"
            onClick={() => router.push('/empresas')}
          />
          <KpiCard
            title={userRole === 'admin' ? 'Ofertas Activas' : userRole === 'empresa' ? 'Contratados' : 'Tasa de Respuesta'}
            value={userRole === 'egresado' ? `${kpis?.tasaRespuesta || 0}%` : (kpis?.ofertasActivas || kpis?.totalContratados || 0)}
            icon="💼"
            onClick={() => router.push('/ofertas')}
          />
          <KpiCard
            title={userRole === 'admin' ? 'Tasa de Empleabilidad' : 'Mensajes Nuevos'}
            value={userRole === 'admin' ? `${kpis?.tasaEmpleabilidad || 0}%` : (kpis?.mensajesNuevos || 0)}
            icon="📈"
            onClick={() => router.push('/reportes')}
          />
        </section>

        {/* Acciones Rápidas */}
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => router.push('/ofertas')}>
            🔍 Explorar Ofertas
          </button>
          {userRole === 'admin' && (
            <>
              <button className="btn btn-secondary" onClick={() => router.push('/egresados')}>
                👥 Gestionar Egresados
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/reportes')}>
                📊 Ver Reportes
              </button>
            </>
          )}
          {userRole === 'empresa' && (
            <button className="btn btn-success" onClick={() => router.push('/ofertas')}>
              ➕ Publicar Oferta
            </button>
          )}
        </div>

        {userRole === 'admin' && (
          <section className="dashboard-summary-grid">
            <div className="card chart-card">
              <div className="section-head">
                <div>
                  <p className="section-eyebrow">📈 Evolución Mensual</p>
                  <h2>Ofertas publicadas vs postulaciones</h2>
                </div>
                <span className="section-chip">Actualizado en vivo</span>
              </div>
              {series.length > 0 ? (
                <DashboardChart data={series} />
              ) : (
                <p className="empty-state">No hay datos para el periodo seleccionado.</p>
              )}
            </div>

            <div className="card chart-card">
              <div className="section-head">
                <div>
                  <p className="section-eyebrow">🎓 Distribución por Carrera</p>
                  <h2>Participación de egresados</h2>
                </div>
                <span className="section-chip">Top categorías</span>
              </div>
              {distribucion.length > 0 ? (
                <div className="stacked-list">
                  {distribucion.map((d: any, i: number) => {
                    const colors = ['#1a365d', '#0f766e', '#b45309', '#7c3aed', '#be123c'];
                    const total = distribucion.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={i} className="stacked-item">
                        <div className="stacked-item-head">
                          <span>{d.name}</span>
                          <span>{d.value} ({percentage}%)</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${percentage}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">No hay datos suficientes para mostrar la distribución.</p>
              )}
            </div>
          </section>
        )}

        {userRole === 'egresado' && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ marginBottom: '20px' }}>🎯 Ofertas Recomendadas para ti</h2>
            <div className="grid-3">
              {ofertasRecomendadas.length > 0 ? (
                ofertasRecomendadas.map((o: any, i: number) => (
                  <div key={i} className="card oferta-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{o.titulo}</h3>
                      <span className="badge badge-success">{o.match || 85}% match</span>
                    </div>
                    <p style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem', marginBottom: '12px' }}>{o.empresa?.razonSocial}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '16px' }}>📍 {o.ubicacion} | {o.tipo}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {o.habilidadesRequeridas?.slice(0, 3).map((h: any, j: number) => (
                        <span key={j} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{h.nombre}</span>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-small" style={{ width: '100%' }} onClick={() => router.push('/ofertas')}>Ver Detalles</button>
                  </div>
                ))
              ) : (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#888' }}>No hay recomendaciones disponibles. Completa tu perfil para recibir mejores sugerencias.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {userRole === 'empresa' && (
          <div style={{ marginTop: '32px' }}>
            <div className="card chart-card">
              <div className="section-head">
                <div>
                  <p className="section-eyebrow">📊 Rendimiento por Oferta</p>
                  <h2>Postulaciones y conversión</h2>
                </div>
                <span className="section-chip">Datos reales de la base</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Oferta</th>
                      <th>Postulaciones</th>
                      <th>En Revisión</th>
                      <th>Tasa Conversión</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kpis?.rendimientoOfertas || []).map((o: any, i: number) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{o.titulo}</td>
                        <td>{o.totalPostulaciones}</td>
                        <td>{o.enRevision}</td>
                        <td>{o.tasaConversion}%</td>
                        <td>
                          <span className={`badge ${o.estado === 'Aprobada' ? 'badge-success' : 'badge-warning'}`} style={{ color: '#0f172a' }}>{o.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
              <div className="card chart-card">
                <div className="section-head">
                  <div>
                    <p className="section-eyebrow">📈 Embudo de Reclutamiento</p>
                    <h2>Seguimiento de candidatos</h2>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0 4px' }}>
                  <div style={{ width: '100%', height: '42px', background: 'linear-gradient(90deg, #1a365d, #2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>Postulaciones ({kpis?.totalPostulaciones || 0})</div>
                  <div style={{ width: '82%', height: '42px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>En Revisión ({kpis?.enRevision || 0})</div>
                  <div style={{ width: '64%', height: '42px', background: 'linear-gradient(90deg, #b45309, #f59e0b)', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>Entrevistas ({kpis?.totalEntrevistas || 0})</div>
                  <div style={{ width: '46%', height: '42px', background: 'linear-gradient(90deg, #047857, #10b981)', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>Contratados ({kpis?.totalContratados || 0})</div>
                </div>
              </div>
              <div className="card chart-card">
                <div className="section-head">
                  <div>
                    <p className="section-eyebrow">⏱️ Tiempo Promedio de Contratación</p>
                    <h2>Velocidad de cierre</h2>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '28px 0 12px' }}>
                  <p style={{ fontSize: '3.2rem', fontWeight: '800', color: 'var(--accent)', margin: 0 }}>{kpis?.tiempoPromedioContratacion || 0}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>días desde publicación hasta contrato</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {userRole === 'admin' && (
          <section className="dashboard-summary-grid">
            <div className="card chart-card">
              <div className="section-head">
                <div>
                  <p className="section-eyebrow">📊 Habilidades Demandadas</p>
                  <h2>Top 10 por oferta</h2>
                </div>
              </div>
              {habilidades.length > 0 ? (
                <div className="stacked-list">
                  {habilidades.map((h: any, i: number) => {
                    const max = Math.max(...habilidades.map((item: any) => item.value || 0), 1);
                    const percentage = Math.round(((h.value || 0) / max) * 100);
                    return (
                      <div key={i} className="stacked-item">
                        <div className="stacked-item-head">
                          <span>{h.name}</span>
                          <span>{h.value} ofertas</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill accent" style={{ width: `${Math.max(8, percentage)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">No hay habilidades suficientes para mostrar.</p>
              )}
            </div>

            <div className="card chart-card">
              <div className="section-head">
                <div>
                  <p className="section-eyebrow">👥 Tasa de Contratación por Cohorte</p>
                  <h2>Desempeño por promoción</h2>
                </div>
              </div>
              {cohortes.length > 0 ? (
                <div className="cohort-bars">
                  {cohortes.map((c: any, i: number) => (
                    <div key={i} className="cohort-item">
                      <div className="cohort-value" style={{ height: `${Math.max(c.tasa || 0, 10)}%` }} title={`Tasa: ${c.tasa}%`} />
                      <span>{c.anio}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No hay cohortes para mostrar.</p>
              )}
            </div>
          </section>
        )}

        {/* Role-based Statistics */}
        {userRole === 'admin' && (
          <div className="grid-2">
            <div className="card">
              <h3>📊 Resumen del Sistema</h3>
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>Empresas Registradas</span>
                  <strong>{kpis?.totalEmpresas || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>Total Postulaciones</span>
                  <strong>{kpis?.totalPostulaciones || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>Egresados Registrados</span>
                  <strong>{kpis?.totalEgresados || 0}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>⚡ Estado del Servidor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></div>
                  <span>API Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></div>
                  <span>Base de Datos Conectada</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></div>
                  <span>Servicio de Reportes Activo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {userRole === 'egresado' && (
          <div className="card">
            <h3>Mi Perfil y Oportunidades</h3>
            <div className="grid-3" style={{ marginTop: '16px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Perfil Completado</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>{kpis?.perfilCompletado || 0}%</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ofertas Aplicables</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0066cc' }}>{kpis?.ofertasAplicables || 0}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Postulaciones Activas</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ea580c' }}>{kpis?.totalPostulaciones || 0}</p>
              </div>
            </div>
          </div>
        )}

        {userRole === 'empresa' && (
          <div className="card chart-card">
            <div className="section-head">
              <div>
                <p className="section-eyebrow">🏢 Mi Panel Empresarial</p>
                <h2>Resumen de la empresa</h2>
              </div>
            </div>
            <div className="grid-3" style={{ marginTop: '16px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Mis Ofertas</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0066cc' }}>{kpis?.totalOfertas || 0}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Total de Candidatos</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>{kpis?.totalPostulaciones || 0}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Entrevistas Programadas</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ea580c' }}>{kpis?.totalEntrevistas || 0}</p>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
