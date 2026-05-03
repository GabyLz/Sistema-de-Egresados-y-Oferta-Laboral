'use client';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Reporte {
  id: string;
  tipoReporte: string;
  estado: string;
  fechaSolicitud: string;
  urlArchivo?: string;
  parametros?: any;
}

export default function ReportesPage() {
  const { isLoggedIn, userRole, userId, userName, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, authLoading, router]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [tipoReporte, setTipoReporte] = useState(userRole === 'admin' ? 'empleabilidad' : 'postulaciones');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tiposAdmin = [
    { valor: 'empleabilidad', label: '📊 Reporte de Empleabilidad' },
    { valor: 'demanda', label: '💼 Reporte de Demanda Laboral' },
    { valor: 'egresados_carrera', label: '👥 Egresados por Carrera' },
    { valor: 'satisfaccion', label: '🤝 Satisfacción de Empresas' },
  ];

  const tiposEgresado = [
    { valor: 'postulaciones', label: '📬 Mis Postulaciones' },
    { valor: 'habilidades', label: '📊 Mis Habilidades vs Mercado' },
  ];

  const tiposEmpresa = [
    { valor: 'postulantes_oferta', label: '👥 Candidatos por Oferta' },
    { valor: 'rendimiento', label: '📈 Rendimiento de Publicaciones' },
  ];

  const tiposDisponibles = userRole === 'admin' ? tiposAdmin : userRole === 'egresado' ? tiposEgresado : tiposEmpresa;

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    carrera: '',
    empresa: ''
  });

  const handleGenerarReporte = async () => {
    if (!userId) {
      setError('❌ No se ha detectado una sesión activa.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/reportes/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoReporte,
          usuarioId: userId,
          parametros: { filtros }
        }),
      });

      if (res.ok) {
        const nuevoReporte = await res.json();
        setSuccess('✅ Reporte generado y guardado en el historial.');
        setTimeout(() => setSuccess(null), 4000);
        await fetchHistorial();
        
        // Ejecutar descarga inmediata con datos reales (esperar a que termine)
        await handleDescargar(nuevoReporte);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al generar reporte');
      }
    } catch (e: any) {
      setError(`❌ Error: ${e.message || 'No se pudo conectar con el servidor'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async () => {
    if (!userId) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/reportes/historial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId }),
      });
      if (response.ok) {
        setReportes(await response.json());
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchHistorial();
  }, [userId]);

  const handleDescargar = async (reporte: Reporte) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const filters = reporte.parametros?.filtros || {};
      
      // Construir query string para los filtros
      const queryParams = new URLSearchParams();
      if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
      if (filters.carrera) queryParams.append('carrera', filters.carrera);
      if (filters.empresa) queryParams.append('empresa', filters.empresa);

      const [kpiRes, distRes, habRes, cohorteRes] = await Promise.all([
        fetch(`${baseUrl}/estadisticas/admin/kpis?${queryParams.toString()}`),
        fetch(`${baseUrl}/estadisticas/admin/distribucion?${queryParams.toString()}`),
        fetch(`${baseUrl}/estadisticas/admin/habilidades?${queryParams.toString()}`),
        fetch(`${baseUrl}/estadisticas/admin/cohortes?${queryParams.toString()}`)
      ]);

      const kpis = kpiRes.ok ? await kpiRes.json() : null;
      const distribucion = distRes.ok ? await distRes.json() : [];
      const habilidades = habRes.ok ? await habRes.json() : [];
      const cohortes = cohorteRes.ok ? await cohorteRes.json() : [];

      // Obtener datos específicos según el tipo de reporte
      let dynamicContent = '';
      const tipo = reporte.tipoReporte.toLowerCase();

      if (tipo === 'egresados_carrera') {
        dynamicContent = `
          <div class="section">
            <div class="section-title">Análisis de Egresados por Carrera</div>
            <table>
              <thead>
                <tr><th>Carrera</th><th>Cantidad de Egresados</th></tr>
              </thead>
              <tbody>
                ${distribucion.length > 0 
                  ? distribucion.map((d: any) => `<tr><td>${d.name}</td><td>${d.value}</td></tr>`).join('')
                  : '<tr><td colspan="2">No hay datos para los filtros seleccionados</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      } else if (tipo === 'demanda') {
        dynamicContent = `
          <div class="section">
            <div class="section-title">Habilidades más Solicitadas (Demanda Laboral)</div>
            <p>Basado en las ofertas laborales publicadas en el periodo seleccionado.</p>
            <table>
              <thead>
                <tr><th>Habilidad</th><th>Frecuencia en Ofertas</th></tr>
              </thead>
              <tbody>
                ${habilidades.length > 0
                  ? habilidades.map((h: any) => `<tr><td>${h.name}</td><td>${h.value}</td></tr>`).join('')
                  : '<tr><td colspan="2">No hay datos de demanda para este periodo</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      } else if (tipo === 'empleabilidad') {
        dynamicContent = `
          <div class="section">
            <div class="section-title">Análisis de Empleabilidad</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Tasa General</div>
                <div style="font-size: 2rem; font-weight: 800; color: #0066cc;">${kpis?.tasaEmpleabilidad || 0}%</div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Egresados Empleados</div>
                <div style="font-size: 2rem; font-weight: 800; color: #10b981;">${Math.round((kpis?.totalEgresados || 0) * (kpis?.tasaEmpleabilidad || 0) / 100)}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr><th>Cohorte (Año)</th><th>Tasa de Empleabilidad</th><th>Total Egresados</th></tr>
              </thead>
              <tbody>
                ${cohortes.length > 0
                  ? cohortes.map((c: any) => `<tr><td>${c.anio}</td><td>${c.tasa}%</td><td>${c.total}</td></tr>`).join('')
                  : '<tr><td colspan="3">No hay datos de cohortes disponibles</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      } else if (tipo === 'ofertas_activas') {
        dynamicContent = `
          <div class="section">
            <div class="section-title">Reporte de Ofertas Laborales Activas</div>
            <div style="padding: 15px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <p><strong>Total de Ofertas Vigentes:</strong> ${kpis?.ofertasActivas || 0}</p>
              <p><strong>Empresas con Ofertas:</strong> ${kpis?.totalEmpresas || 0}</p>
            </div>
            <p style="font-size: 0.9rem; color: #64748b;">Este reporte muestra un resumen de las oportunidades laborales disponibles en la plataforma para los egresados.</p>
          </div>
        `;
      } else {
        // Reporte por defecto (Resumen Ejecutivo)
        dynamicContent = `
          <div class="section">
            <div class="section-title">Resumen Ejecutivo del Sistema</div>
            <table>
              <thead>
                <tr><th>Indicador</th><th>Valor Real</th><th>Estado</th></tr>
              </thead>
              <tbody>
                <tr><td>Total Egresados</td><td>${kpis?.totalEgresados || 0}</td><td>Sincronizado</td></tr>
                <tr><td>Empresas Activas</td><td>${kpis?.totalEmpresas || 0}</td><td>Validadas</td></tr>
                <tr><td>Ofertas Laborales</td><td>${kpis?.ofertasActivas || 0}</td><td>Vigentes</td></tr>
                <tr><td>Postulaciones Totales</td><td>${kpis?.totalPostulaciones || 0}</td><td>Registradas</td></tr>
              </tbody>
            </table>
          </div>
        `;
      }

      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
        <html>
          <head>
            <title>Reporte SEGO - ${reporte.tipoReporte.toUpperCase()}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: 800; color: #0066cc; }
              .report-info { text-align: right; font-size: 0.9rem; color: #64748b; }
              h1 { color: #0f172a; margin-top: 0; font-size: 1.8rem; }
              .section { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
              .section-title { font-weight: 700; text-transform: uppercase; color: #0066cc; font-size: 0.85rem; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 0.9rem; }
              th { background: #f1f5f9; font-weight: 700; color: #475569; }
              .footer { margin-top: 50px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">SEGO SYSTEM</div>
              <div class="report-info">
                <p>ID Reporte: ${reporte.id.substring(0, 8)}</p>
                <p>Generado: ${new Date(reporte.fechaSolicitud).toLocaleString()}</p>
              </div>
            </div>

            <h1>Reporte de ${(reporte.tipoReporte || 'General').replace('_', ' ').toUpperCase()}</h1>
            
            <div class="section">
              <div class="section-title">Resumen de Parámetros</div>
              <p><strong>Usuario Solicitante:</strong> ${userName || 'Administrador'}</p>
              <p><strong>Filtros Aplicados:</strong> ${reporte.parametros?.filtros?.carrera || 'Todas las carreras'} | ${reporte.parametros?.filtros?.empresa || 'Todas las empresas'}</p>
              <p><strong>Periodo:</strong> ${reporte.parametros?.filtros?.fechaInicio || 'Inicio'} hasta ${reporte.parametros?.filtros?.fechaFin || 'Hoy'}</p>
            </div>

            ${dynamicContent}

            <div class="footer">
              Este es un documento oficial generado por la plataforma SEGO - Sistema de Egresados y Oferta Laboral.
              <br>© ${new Date().getFullYear()} Universidad Nacional Mayor de San Marcos
            </div>

            <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                🖨️ Imprimir o Guardar PDF
              </button>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
        reportWindow.document.close();
      }
    } catch (e) {
      setError('Error al generar PDF con datos dinámicos');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell management-page">
      <div className="page-header">
          <h1>
            {userRole === 'admin' 
              ? '📋 Reportes del Sistema' 
              : userRole === 'empresa' 
                ? '👥 Gestión de Candidatos' 
                : '📬 Mis Postulaciones'}
          </h1>
          <p>
            {userRole === 'admin' 
              ? 'Genera y descarga reportes analíticos de la plataforma' 
              : userRole === 'empresa' 
                ? 'Revisa y gestiona los egresados que han postulado a tus ofertas' 
                : 'Seguimiento de tus candidaturas y estados de postulación'}
          </p>
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

        <div className="grid-2">
          {/* Generador de Reportes (Visible solo para Admin o para generar solicitudes específicas) */}
          <div className="card management-card">
            <h2>{userRole === 'admin' ? 'Generar Nuevo Reporte' : 'Solicitar Nuevo Reporte'}</h2>

            <div className="form-group">
              <label>Tipo de {userRole === 'admin' ? 'Reporte' : 'Documento'}</label>
              <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})} />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: '20px', width: '100%' }}
              onClick={handleGenerarReporte}
              disabled={loading}
            >
              {loading ? '⌛ Generando...' : '🚀 Generar Reporte'}
            </button>
          </div>

          {/* Resumen */}
          <div className="card management-card">
            <h2>Información</h2>
            <div style={{ padding: '16px 0' }}>
              <p>
                <strong>Total de Reportes:</strong> {reportes.length}
              </p>
              <p>
                <strong>Completados:</strong> {reportes.filter((r) => r.estado === 'completado').length}
              </p>
              <p>
                <strong>En Proceso:</strong> {reportes.filter((r) => r.estado === 'procesando').length}
              </p>
            </div>

            <hr style={{ borderColor: '#e2e8f0', margin: '16px 0' }} />

            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Los reportes se generan en PDF con gráficos analíticos completos. Puedes descargarlos directamente.
            </p>
          </div>
        </div>

        <div className="card management-card">
          <h2>{userRole === 'admin' ? 'Historial de Reportes' : userRole === 'empresa' ? 'Mis Candidatos' : 'Mis Postulaciones'}</h2>
          <div className="table-container management-table">
            <table>
              <thead>
                <tr>
                  <th>{userRole === 'admin' ? 'Tipo' : userRole === 'empresa' ? 'Candidato / Oferta' : 'Oferta / Empresa'}</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No hay registros disponibles
                    </td>
                  </tr>
                ) : (
                  reportes.map((reporte) => (
                    <tr key={reporte.id}>
                      <td>{reporte.tipoReporte.replace('_', ' ').toUpperCase()}</td>
                      <td>{new Date(reporte.fechaSolicitud).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${reporte.estado === 'completado' ? 'badge-success' : 'badge-warning'}`} style={{ color: '#0f172a' }}>
                          {reporte.estado === 'completado' ? 'Completado' : 'Procesando'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-small btn-report"
                          style={{ backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8' }}
                          onClick={() => handleDescargar(reporte)}
                          disabled={reporte.estado !== 'completado'}
                        >
                          {reporte.estado === 'completado' ? '⬇️ Descargar' : '⏳ Procesando'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </main>
  );
}
