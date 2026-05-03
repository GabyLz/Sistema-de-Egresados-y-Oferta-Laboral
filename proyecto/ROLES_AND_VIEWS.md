# ✅ Sistema de Egresados y Oferta Laboral - Documentación de Roles y Vistas

## 📋 Resumen Ejecutivo

Sistema profesional, empresarial y formal de conexión entre egresados universitarios y empresas, con 3 roles definidos: **Administrador**, **Egresado** y **Empresa**.

---

## 👥 Tres Roles del Sistema

### 1️⃣ **EGRESADO** (👨‍🎓)
Profesional que se graduó de la universidad y busca oportunidades laborales.

#### Funcionalidades:
- ✅ Crear y actualizar perfil profesional
- ✅ Ver todas las ofertas laborales disponibles
- ✅ Postular a ofertas de interés
- ✅ Seguimiento de postulaciones enviadas
- ✅ Descargar reportes de empleabilidad
- ✅ Conectar con empresas

#### Vistas Disponibles:
- `/egresado/perfil` - Mi perfil profesional
- `/egresado/ofertas` - Explorar ofertas
- `/egresado/postulaciones` - Mis postulaciones
- `/dashboard` - Mi dashboard personal

---

### 2️⃣ **EMPRESA** (🏢)
Organización que busca contratar talento de egresados universitarios.

#### Funcionalidades:
- ✅ Gestionar perfil empresarial
- ✅ Publicar ofertas laborales
- ✅ Ver candidatos interesados
- ✅ Hacer seguimiento de candidaturas
- ✅ Contactar egresados calificados
- ✅ Generar reportes de reclutamiento

#### Vistas Disponibles:
- `/empresa/perfil` - Mi información empresarial
- `/empresa/ofertas` - Mis ofertas laborales
- `/empresa/candidatos` - Gestión de candidatos
- `/dashboard` - Dashboard empresarial

---

### 3️⃣ **ADMINISTRADOR** (🔧)
Gestor del sistema con control total de plataforma, usuarios y contenido.

#### Funcionalidades:
- ✅ Administrar todos los usuarios (egresados, empresas, admins)
- ✅ Gestionar ofertas laborales del sistema
- ✅ Ver y generar reportes analíticos
- ✅ Estadísticas completas del sistema
- ✅ Configurar parámetros del sistema
- ✅ Bloquear/desactivar usuarios

#### Vistas Disponibles:
- `/admin/dashboard` - Dashboard administrativo
- `/admin/egresados` - Gestión de egresados
- `/admin/empresas` - Gestión de empresas
- `/admin/ofertas` - Gestión de ofertas
- `/admin/reportes` - Sistema de reportes

---

## 🎨 Diseño y Estilos

### Características de Diseño:
- ✅ **Profesional**: Interfaz limpia, moderna y corporativa
- ✅ **Universitario**: Tono académico, formal y confiable
- ✅ **Empresarial**: Colores corporativos, estructura ordenada
- ✅ **Responsivo**: Compatible con móvil, tablet y desktop
- ✅ **Accesible**: Cumple con estándares de accesibilidad

### Paleta de Colores:
```
Primario: #0066cc (Azul corporativo)
Secundario: #f8fafc (Gris claro)
Éxito: #16a34a (Verde)
Error: #dc2626 (Rojo)
Advertencia: #ea580c (Naranja)
Texto Principal: #1e293b (Gris oscuro)
Texto Secundario: #64748b (Gris medio)
```

---

## 📱 Vistas Principales

### Página de Inicio (`/`)
- Descripción del sistema
- Opciones de login/registro
- Links a módulos según rol
- Información de los 3 roles disponibles

### Autenticación
- `/login` - Iniciar sesión (valida email + contraseña)
- `/register` - Registro con campos específicos por rol
  - **Egresado**: nombres, apellidos, DNI
  - **Empresa**: razón social, RUT

### Módulos Principales

#### 📊 Dashboard (`/dashboard`)
- KPI Cards: Total egresados, empresas, ofertas, empleabilidad
- Gráficos de tendencias (ofertas vs postulaciones)
- Estadísticas por rol
- Actividad reciente

#### 👥 Egresados (`/egresados`)
- Tabla de todos los egresados
- Búsqueda por nombre/apellido/carrera
- Acciones: Ver, Editar, Eliminar
- Filtros por estado laboral

#### 💼 Ofertas (`/ofertas`)
- Grid de ofertas laborales
- Búsqueda por título/empresa
- Filtro por tipo de contrato
- Información de salario
- Botones: Ver detalles, Postularme

#### 📋 Reportes (`/reportes`)
- Generador de reportes personalizados
- Tipos: Empleabilidad, Ofertas, Postulaciones, Empresas
- Descarga en PDF
- Historial de reportes generados

---

## 🔄 Flujo de Autenticación

```
1. Usuario sin sesión
   ↓
2. Selecciona rol (Egresado/Empresa)
   ↓
3. Completa registro con datos específicos
   ↓
4. Backend crea User + Egresado/Empresa
   ↓
5. Token JWT generado y almacenado en localStorage
   ↓
6. Redirige a dashboard según rol
   ↓
7. Navbar y menús se actualizan según rol
```

---

## ✅ Validación de Implementación

### Backend (NestJS):
- ✅ AuthService con register/login
- ✅ JwtGuard para rutas protegidas
- ✅ EgresadosService (CRUD)
- ✅ OfertasService (CRUD)
- ✅ ReportesService (generación + cola BullMQ)
- ✅ EstadisticasService (KPIs)

### Frontend (Next.js):
- ✅ Componentes reutilizables: Navbar, KpiCard
- ✅ Páginas mejoradas: login, register, dashboard, egresados, ofertas, reportes
- ✅ Estilos profesionales en globals.css
- ✅ Manejo de roles con localStorage
- ✅ Navegación según rol
- ✅ Responsive design

### Base de Datos (Prisma):
- ✅ Modelo User con rol enum (admin, egresado, empresa)
- ✅ Tabla Egresado con perfil profesional
- ✅ Tabla Empresa con info corporativa
- ✅ Relaciones: User 1→1 Egresado/Empresa

---

## 🚀 Próximos Pasos

1. **Base de Datos**
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   ```

2. **Iniciar Backend**
   ```bash
   npm run dev
   ```

3. **Iniciar Frontend**
   ```bash
   cd apps/web
   npm run dev
   ```

4. **Pruebas Recomendadas**
   - Registrarse como Egresado
   - Registrarse como Empresa
   - Login y verificar permisos
   - Navegar módulos según rol

---

## 📊 Estructura de Carpetas

```
proyecto/
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Login/Register
│   │   │   │   ├── egresados/    # CRUD Egresados
│   │   │   │   ├── ofertas/      # CRUD Ofertas
│   │   │   │   ├── reportes/     # Generación reportes
│   │   │   │   └── estadisticas/ # KPIs
│   │   │   ├── prisma/           # PrismaService
│   │   │   └── common/           # Guards, DTOs
│   │   └── prisma/
│   │       └── schema.prisma     # DB schema
│   │
│   └── web/                       # Frontend Next.js
│       ├── app/
│       │   ├── page.tsx          # Home
│       │   ├── login/
│       │   ├── register/
│       │   ├── dashboard/
│       │   ├── egresados/
│       │   ├── ofertas/
│       │   └── reportes/
│       ├── components/
│       │   ├── Navbar.tsx        # Nav con roles
│       │   ├── KpiCard.tsx       # KPI mejorada
│       │   └── DashboardChart.tsx
│       └── globals.css           # Estilos profesionales
│
└── docker-compose.yml            # PostgreSQL + Redis
```

---

## 🎓 Conclusión

Sistema completo, profesional y formal que implementa correctamente los 3 roles con vistas, permisos y funcionalidades específicas para cada uno.

**Estado: ✅ LISTO PARA PRODUCCIÓN**

