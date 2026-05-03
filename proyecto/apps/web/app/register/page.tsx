'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const [rol, setRol] = useState<'egresado' | 'empresa'>('egresado');
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nombres: '',
    apellidos: '',
    dni: '',
    carrera: '',
    anioEgreso: new Date().getFullYear(),
    habilidadesIds: [] as string[],
    razonSocial: '',
    nombreComercial: '',
    rut: '',
    telefono: '',
    descripcion: '',
    sector: '',
    // Formación Académica
    institucion: '',
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
  });

  // Skills State
  const [availableSkills, setAvailableSkills] = useState<{ id: string; nombre: string; tipo: string }[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillList, setShowSkillList] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsLoadError, setSkillsLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040').replace(/\/$/, '');
      setSkillsLoading(true);
      setSkillsLoadError(null);
      try {
        const res = await fetch(`${baseUrl}/habilidades`);
        if (!res.ok) {
          setSkillsLoadError(`No se pudo cargar habilidades (HTTP ${res.status}).`);
          setAvailableSkills([]);
          return;
        }
        setAvailableSkills(await res.json());
      } catch (e) {
        setSkillsLoadError('No se pudo conectar con el API para cargar habilidades. Inicia el servidor API en http://localhost:3040.');
        setAvailableSkills([]);
      } finally {
        setSkillsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const validateStep1 = () => {
    const { email, password, passwordConfirm } = formData;
    if (!email || !password || !passwordConfirm) return 'Todos los campos son obligatorios';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Formato de correo inválido';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    if (password !== passwordConfirm) return 'Las contraseñas no coinciden';
    return null;
  };

  const validateStep2Egresado = () => {
    const { nombres, apellidos, dni } = formData;
    if (!nombres || !apellidos || !dni) return 'Nombre, apellidos y DNI son obligatorios';
    if (!/^\d{8,12}$/.test(dni)) return 'DNI inválido (8-12 dígitos)';
    return null;
  };

  const validateEmpresa = () => {
    const { razonSocial, rut, telefono, descripcion } = formData;
    if (!razonSocial || !rut || !telefono) return 'Razón social, RUC y teléfono son obligatorios';
    if (!/^\d{11}$/.test(rut)) return 'El RUC debe tener exactamente 11 dígitos';
    if (!/^9\d{8}$/.test(telefono)) return 'Teléfono inválido (formato peruano: 9XXXXXXXX)';
    if (descripcion.length > 500) return 'La descripción no puede exceder los 500 caracteres';
    return null;
  };

  const handleNext = () => {
    const error = rol === 'egresado' ? (step === 1 ? validateStep1() : validateStep2Egresado()) : validateStep1();
    if (error) {
      setMessage({ text: error, type: 'error' });
      return;
    }
    setMessage(null);
    if (rol === 'egresado' && step < 3) setStep((s) => (s + 1) as Step);
    else if (rol === 'empresa') submit();
    else if (rol === 'egresado' && step === 3) submit();
  };

  const submit = async () => {
    if (rol === 'empresa') {
      const error = validateEmpresa();
      if (error) {
        setMessage({ text: error, type: 'error' });
        return;
      }
    }

    setLoading(true);
    setMessage({ text: 'Procesando registro...', type: 'info' });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rol }),
      });

      if (response.ok) {
        setMessage({ text: '✅ Registro exitoso. Por favor inicia sesión.', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const err = await response.json();
        setMessage({ text: err.message || 'Error en el registro', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ Error de conexión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (id: string) => {
    setFormData(prev => ({
      ...prev,
      habilidadesIds: prev.habilidadesIds.includes(id)
        ? prev.habilidadesIds.filter(sid => sid !== id)
        : [...prev.habilidadesIds, id]
    }));
  };

  return (
    <>
      <main className="public-shell" style={{ background: '#f1f5f9' }}>
        <div className="public-container" style={{ maxWidth: '780px' }}>
          <div className="card auth-card">
            <h1 style={{ marginBottom: '8px' }}>✍️ Crear Cuenta</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              {rol === 'egresado' ? 'Únete como egresado y encuentra tu próximo empleo' : 'Registra tu empresa y encuentra el mejor talento'}
            </p>

            {/* Role Selection (Only Step 1) */}
            {step === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                <button
                  type="button"
                  onClick={() => setRol('egresado')}
                  className={`btn ${rol === 'egresado' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ opacity: rol === 'egresado' ? 1 : 0.6 }}
                >
                  👨‍🎓 Soy Egresado
                </button>
                <button
                  type="button"
                  onClick={() => setRol('empresa')}
                  className={`btn ${rol === 'empresa' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ opacity: rol === 'empresa' ? 1 : 0.6 }}
                >
                  🏢 Soy Empresa
                </button>
              </div>
            )}

            {/* Progress Indicator for Egresado */}
            {rol === 'egresado' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{ 
                    zIndex: 1, 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: step >= s ? 'var(--accent)' : '#e2e8f0', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              {/* STEP 1: Access Data (Common) */}
              {step === 1 && (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Datos de Acceso</h3>
                  <div className="form-group">
                    <label>Correo Electrónico Institucional/Personal</label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@universidad.edu.pe"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contraseña (mín. 8 caracteres)</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirmar Contraseña</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.passwordConfirm}
                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 EGRESADO: Personal Info */}
              {rol === 'egresado' && step === 2 && (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Información Personal</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombres</label>
                      <input
                        type="text"
                        required
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Apellidos</label>
                      <input
                        type="text"
                        required
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>DNI / Documento de Identidad</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 EGRESADO: Academic & Skills */}
              {rol === 'egresado' && step === 3 && (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Datos Académicos</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Carrera Profesional</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Ingeniería de Sistemas, Medicina, Derecho..."
                        value={formData.carrera}
                        onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Año de Egreso</label>
                      <input
                        type="number"
                        min={2016}
                        max={2026}
                        value={formData.anioEgreso}
                        onChange={(e) => setFormData({ ...formData, anioEgreso: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <h4 style={{ margin: '20px 0 12px', fontSize: '1rem', color: 'var(--accent)' }}>🎓 Formación Académica Reciente</h4>
                  <div className="form-group">
                    <label>Institución / Universidad</label>
                    <input
                      type="text"
                      placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                      value={formData.institucion}
                      onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Título / Grado Obtenido</label>
                    <input
                      type="text"
                      placeholder="Ej: Bachiller en Ingeniería de Sistemas"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha Inicio</label>
                      <input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha Fin (opcional)</label>
                      <input
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      />
                    </div>
                  </div>

                  <h4 style={{ margin: '24px 0 12px', fontSize: '1rem', color: 'var(--accent)' }}>🛠️ Habilidades</h4>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label>Habilidades Técnicas y Blandas</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {formData.habilidadesIds.map(hId => {
                        const skill = availableSkills.find(s => s.id === hId);
                        return skill ? (
                          <span key={hId} className="user-badge" style={{ background: 'var(--accent)', color: 'white', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {skill.nombre}
                            <button type="button" onClick={() => toggleSkill(hId)} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                          </span>
                        ) : null;
                      })}
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar habilidades (ej: React, Liderazgo...)"
                      value={skillSearch}
                      onChange={(e) => { setSkillSearch(e.target.value); setShowSkillList(true); }}
                      onFocus={() => setShowSkillList(true)}
                    />
                    {showSkillList && (
                      <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', padding: '8px' }}>
                        {skillsLoadError ? (
                          <p style={{ padding: '8px', color: '#991b1b', fontSize: '0.85rem', margin: 0 }}>{skillsLoadError}</p>
                        ) : skillsLoading ? (
                          <p style={{ padding: '8px', color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Cargando habilidades...</p>
                        ) : (
                          availableSkills
                            .filter(s => 
                              (!skillSearch || s.nombre.toLowerCase().includes(skillSearch.toLowerCase())) && 
                              !formData.habilidadesIds.includes(s.id)
                            )
                            .map(s => (
                              <div 
                                key={s.id} 
                                onClick={() => { toggleSkill(s.id); setSkillSearch(''); setShowSkillList(false); }}
                                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                className="skill-item"
                              >
                                {s.nombre} <small style={{ color: '#888' }}>({s.tipo})</small>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EMPRESA FORM (Direct after Step 1) */}
              {rol === 'empresa' && step === 1 && (
                <div className="fade-in" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Datos de la Empresa</h3>
                  <div className="form-group">
                    <label>Razón Social (según SUNAT)</label>
                    <input
                      type="text"
                      placeholder="Nombre Legal S.A.C."
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Comercial (opcional)</label>
                    <input
                      type="text"
                      placeholder="Nombre Fantasía"
                      value={formData.nombreComercial}
                      onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RUC (11 dígitos)</label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="20XXXXXXXXX"
                      value={formData.rut}
                      onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sector Económico</label>
                      <select 
                        value={formData.sector} 
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        required
                      >
                        <option value="">Seleccione sector</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Educación">Educación</option>
                        <option value="Salud">Salud</option>
                        <option value="Finanzas">Finanzas</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Teléfono de Contacto</label>
                      <input
                        type="tel"
                        placeholder="9XXXXXXXX"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Descripción de la Empresa (máx. 500 caracteres)</label>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    ></textarea>
                    <small style={{ color: '#888', textAlign: 'right', display: 'block' }}>{formData.descripcion.length}/500</small>
                  </div>
                </div>
              )}

              {message && (
                <div className={`alert alert-${message.type}`} style={{ marginTop: '20px' }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                {step > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => (s - 1) as Step)} style={{ flex: 1 }}>
                    Anterior
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Procesando...' : (rol === 'egresado' && step < 3 ? 'Continuar' : 'Finalizar Registro')}
                </button>
              </div>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.9rem' }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skill-item:hover {
          background: #f0f7ff;
          color: var(--accent);
        }
      `}</style>
    </>
  );
}
