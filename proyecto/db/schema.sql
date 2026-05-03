-- schema.sql: Sistema de Gestión de Egresados y Oferta Laboral
-- (Incluye las tablas proporcionadas por el usuario)

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Usuarios (base para autenticación y roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'egresado', 'empresa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);

-- Tabla de Egresados (extiende users)
CREATE TABLE egresados (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    direccion TEXT,
    carrera VARCHAR(150),
    anio_egreso INTEGER CHECK (anio_egreso > 1950 AND anio_egreso <= EXTRACT(YEAR FROM NOW())),
    cv_url TEXT,
    empleado_actualmente BOOLEAN DEFAULT FALSE,
    habilidades_blandas JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egresados_carrera ON egresados(carrera);
CREATE INDEX idx_egresados_anio_egreso ON egresados(anio_egreso);
CREATE INDEX idx_egresados_dni ON egresados(dni);

-- Tabla de Empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    razon_social VARCHAR(200) NOT NULL,
    rut VARCHAR(50) NOT NULL UNIQUE,
    sector VARCHAR(100),
    ubicacion TEXT,
    sitio_web VARCHAR(255),
    descripcion TEXT
);

CREATE INDEX idx_empresas_sector ON empresas(sector);

-- Tabla de Administradores (simple, solo referencia)
CREATE TABLE administradores (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- Experiencia Laboral del Egresado
CREATE TABLE experiencias_laborales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    empresa VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT,
    CONSTRAINT fecha_coherente CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_exp_egresado ON experiencias_laborales(egresado_id);

-- Formación Académica
CREATE TABLE formaciones_academicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    institucion VARCHAR(200) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE
);

CREATE INDEX idx_formacion_egresado ON formaciones_academicas(egresado_id);

-- Catálogo de Habilidades
CREATE TABLE habilidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('tecnica', 'blanda'))
);

-- Relación Egresado - Habilidad (con nivel)
CREATE TABLE egresado_habilidades (
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    habilidad_id UUID NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
    nivel INTEGER CHECK (nivel BETWEEN 1 AND 5),
    PRIMARY KEY (egresado_id, habilidad_id)
);

-- Ofertas Laborales
CREATE TABLE ofertas_laborales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion TEXT,
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('remoto', 'hibrido', 'presencial')),
    tipo_contrato VARCHAR(20) NOT NULL CHECK (tipo_contrato IN ('fulltime', 'parttime', 'freelance')),
    salario_min DECIMAL(12,2),
    salario_max DECIMAL(12,2),
    activa BOOLEAN DEFAULT TRUE,
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    fecha_cierre DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT salario_coherente CHECK (salario_min <= salario_max),
    CONSTRAINT fecha_cierre_valida CHECK (fecha_cierre >= fecha_publicacion)
);

CREATE INDEX idx_ofertas_empresa ON ofertas_laborales(empresa_id);
CREATE INDEX idx_ofertas_activas ON ofertas_laborales(activa) WHERE activa = true;
CREATE INDEX idx_ofertas_modalidad ON ofertas_laborales(modalidad);
CREATE INDEX idx_ofertas_salario ON ofertas_laborales(salario_min, salario_max);
CREATE INDEX idx_ofertas_fecha_publicacion ON ofertas_laborales(fecha_publicacion);

-- Relación Oferta - Habilidad
CREATE TABLE oferta_habilidades (
    oferta_id UUID NOT NULL REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    habilidad_id UUID NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
    prioridad INTEGER DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 5),
    PRIMARY KEY (oferta_id, habilidad_id)
);

-- Postulaciones
CREATE TABLE postulaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    oferta_id UUID NOT NULL REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'postulado' CHECK (estado IN ('postulado', 'en_revision', 'entrevista', 'contratado', 'rechazado')),
    comentario TEXT,
    fecha_postulacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(egresado_id, oferta_id)
);

CREATE INDEX idx_postulaciones_egresado ON postulaciones(egresado_id);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(oferta_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_postulaciones_fecha ON postulaciones(fecha_postulacion);

-- Historial de cambios de estado de postulación
CREATE TABLE historial_estado_postulaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postulacion_id UUID NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    motivo TEXT,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_historial_postulacion ON historial_estado_postulaciones(postulacion_id);

-- Notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('email', 'interna')),
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(usuario_id, leida) WHERE leida = false;

-- Reportes generados
CREATE TABLE reportes_generados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo_reporte VARCHAR(100) NOT NULL,
    parametros JSONB,
    url_archivo TEXT,
    estado VARCHAR(20) DEFAULT 'procesando' CHECK (estado IN ('procesando', 'completado', 'fallido')),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completado TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reportes_usuario ON reportes_generados(usuario_id);
CREATE INDEX idx_reportes_estado ON reportes_generados(estado);

-- =====================================================
-- Vistas Materializadas para Dashboards de Alto Rendimiento
-- =====================================================

-- Vista de empleabilidad por carrera y año de egreso
CREATE MATERIALIZED VIEW mv_empleabilidad_por_carrera AS
SELECT 
    e.carrera,
    e.anio_egreso,
    COUNT(DISTINCT e.id) AS total_egresados,
    COUNT(DISTINCT CASE WHEN p.estado = 'contratado' THEN e.id END) AS empleados,
    CASE 
        WHEN COUNT(DISTINCT e.id) > 0 
        THEN ROUND(100.0 * COUNT(DISTINCT CASE WHEN p.estado = 'contratado' THEN e.id END) / COUNT(DISTINCT e.id), 2)
        ELSE 0
    END AS tasa_empleabilidad,
    NOW() AS ultima_actualizacion
FROM egresados e
LEFT JOIN postulaciones p ON e.id = p.egresado_id AND p.estado = 'contratado'
GROUP BY e.carrera, e.anio_egreso;

CREATE UNIQUE INDEX idx_mv_empleabilidad_carrera_anio ON mv_empleabilidad_por_carrera (carrera, anio_egreso);

-- Vista de demanda de habilidades (top habilidades más solicitadas)
CREATE MATERIALIZED VIEW mv_demanda_habilidades AS
SELECT 
    h.id AS habilidad_id,
    h.nombre AS habilidad_nombre,
    COUNT(DISTINCT oh.oferta_id) AS total_ofertas,
    RANK() OVER (ORDER BY COUNT(DISTINCT oh.oferta_id) DESC) AS ranking,
    NOW() AS ultima_actualizacion
FROM habilidades h
JOIN oferta_habilidades oh ON h.id = oh.habilidad_id
JOIN ofertas_laborales o ON oh.oferta_id = o.id
WHERE o.activa = true
GROUP BY h.id, h.nombre;

CREATE UNIQUE INDEX idx_mv_demanda_habilidad ON mv_demanda_habilidades (habilidad_id);

-- Función para refrescar vistas materializadas (se puede llamar desde trigger o cron)
CREATE OR REPLACE FUNCTION refresh_dashboard_mv()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_empleabilidad_por_carrera;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_demanda_habilidades;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Funciones y Triggers para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas que tienen updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_egresados_updated_at BEFORE UPDATE ON egresados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ofertas_updated_at BEFORE UPDATE ON ofertas_laborales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_postulaciones_updated_at BEFORE UPDATE ON postulaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Datos iniciales de ejemplo
-- =====================================================

WITH admin_user AS (
    INSERT INTO users (id, email, password_hash, rol)
    VALUES (
        uuid_generate_v4(),
        'admin@sego.local',
        crypt('Admin123*', gen_salt('bf')),
        'admin'
    )
    RETURNING id
)
INSERT INTO administradores (id)
SELECT id FROM admin_user;

WITH egresado_user AS (
    INSERT INTO users (id, email, password_hash, rol)
    VALUES (
        uuid_generate_v4(),
        'egresado@sego.local',
        crypt('Egresado123*', gen_salt('bf')),
        'egresado'
    )
    RETURNING id
)
INSERT INTO egresados (
    id,
    nombres,
    apellidos,
    dni,
    fecha_nacimiento,
    telefono,
    direccion,
    carrera,
    anio_egreso,
    cv_url,
    empleado_actualmente,
    habilidades_blandas
)
SELECT
    id,
    'Luana',
    'García',
    '99999999',
    '1998-04-15',
    '999-888-777',
    'Lima, Perú',
    'Ingeniería de Sistemas',
    2024,
    NULL,
    FALSE,
    '["Comunicación", "Trabajo en equipo", "Proactividad"]'::jsonb
FROM egresado_user;

WITH empresa_user AS (
    INSERT INTO users (id, email, password_hash, rol)
    VALUES (
        uuid_generate_v4(),
        'empresa@sego.local',
        crypt('Empresa123*', gen_salt('bf')),
        'empresa'
    )
    RETURNING id
)
INSERT INTO empresas (
    id,
    razon_social,
    rut,
    sector,
    ubicacion,
    sitio_web,
    descripcion
)
SELECT
    id,
    'Empresa Demo S.A.C.',
    '20123456789',
    'Tecnología',
    'Lima, Perú',
    'https://empresa-demo.local',
    'Empresa de ejemplo para pruebas del sistema.'
FROM empresa_user;

-- =====================================================
-- Índices adicionales para consultas analíticas pesadas
-- =====================================================

-- Para búsquedas por rango salarial en ofertas
CREATE INDEX idx_ofertas_salario_range ON ofertas_laborales(salario_min, salario_max) WHERE activa = true;

-- Para conteo rápido de postulaciones por oferta
CREATE INDEX idx_postulaciones_oferta_estado ON postulaciones(oferta_id, estado);

-- Para búsqueda de egresados por habilidad
CREATE INDEX idx_egresado_habilidad ON egresado_habilidades(habilidad_id, nivel);
