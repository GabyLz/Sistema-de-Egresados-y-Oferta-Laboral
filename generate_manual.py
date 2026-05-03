#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate a comprehensive user manual for the graduate job offer system.
Uses python-docx to create a professional Word document.
"""

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from datetime import datetime

def add_heading_style(doc, text, level=1):
    """Add a heading with consistent styling."""
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return heading

def add_paragraph_style(doc, text, bold=False, italic=False, size=11):
    """Add a paragraph with consistent styling."""
    p = doc.add_paragraph(text)
    for run in p.runs:
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.italic = italic
    return p

def shade_cell(cell, color):
    """Shade a table cell with a color."""
    shading_elm = OxmlElement('w:shd')
    shading_elm.set(qn('w:fill'), color)
    cell._element.get_or_add_tcPr().append(shading_elm)

def create_manual():
    """Create the comprehensive user manual."""
    doc = Document()
    
    # Set document margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # ========== PORTADA ==========
    title = doc.add_heading('Sistema de Egresados y Oferta Laboral', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in title.runs:
        run.font.color.rgb = RGBColor(26, 54, 93)  # #1a365d
    
    subtitle = doc.add_paragraph('Manual de Usuario Completo')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in subtitle.runs:
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(4, 120, 87)  # #047857
    
    doc.add_paragraph()
    
    # Información del documento
    info = doc.add_paragraph()
    info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = info.add_run(f"Documento generado: {datetime.now().strftime('%d de %B de %Y')}\n")
    run.font.size = Pt(10)
    run.font.italic = True
    
    info.add_run("Plataforma de Conexión Laboral Universidad-Empresa\n").font.size = Pt(11)
    info.add_run("Versión 1.0 - 2026").font.size = Pt(10)
    
    doc.add_page_break()
    
    # ========== TABLA DE CONTENIDOS ==========
    add_heading_style(doc, "📋 Tabla de Contenidos", level=1)
    
    toc_items = [
        "1. Introducción",
        "2. Descripción General del Sistema",
        "3. Guía de Inicio Rápido",
        "4. Los Tres Roles del Sistema",
        "5. Funcionalidades por Rol",
        "6. Flujo de Autenticación",
        "7. Guía de Usuario - Egresado",
        "8. Guía de Usuario - Empresa",
        "9. Guía de Usuario - Administrador",
        "10. Preguntas Frecuentes (FAQ)",
        "11. Soporte y Contacto"
    ]
    
    for item in toc_items:
        p = doc.add_paragraph(item, style='List Number')
        p.paragraph_format.left_indent = Inches(0.5)
    
    doc.add_page_break()
    
    # ========== 1. INTRODUCCIÓN ==========
    add_heading_style(doc, "1. Introducción", level=1)
    
    add_paragraph_style(
        doc,
        "Bienvenido al Sistema de Egresados y Oferta Laboral, una plataforma integral diseñada para "
        "conectar profesionales graduados de la universidad con oportunidades laborales ofrecidas por empresas."
    )
    
    add_paragraph_style(
        doc,
        "Este manual de usuario está diseñado para ayudarte a entender y utilizar todas las funcionalidades "
        "del sistema, independientemente de tu rol (Egresado, Empresa o Administrador)."
    )
    
    add_heading_style(doc, "1.1 Propósito del Sistema", level=2)
    add_paragraph_style(
        doc,
        "El objetivo principal de este sistema es facilitar la conexión entre talento universitario recién "
        "egresado y empresas que buscan contratar profesionales de calidad. La plataforma proporciona herramientas "
        "para que egresados encuentren empleo y empresas encuentren candidatos calificados."
    )
    
    add_heading_style(doc, "1.2 Estructura del Manual", level=2)
    add_paragraph_style(
        doc,
        "Este manual está organizado por secciones. Cada sección corresponde a un aspecto específico del sistema. "
        "Se recomienda leer las secciones de inicio rápido antes de explorar características más avanzadas."
    )
    
    doc.add_page_break()
    
    # ========== 2. DESCRIPCIÓN GENERAL ==========
    add_heading_style(doc, "2. Descripción General del Sistema", level=1)
    
    add_heading_style(doc, "2.1 Características Principales", level=2)
    
    features = [
        "✅ Autenticación segura con JWT (JSON Web Tokens) y contraseñas encriptadas con Bcrypt",
        "✅ Tres roles completamente funcionales: Egresado, Empresa y Administrador",
        "✅ Sistema de búsqueda y filtrado de ofertas laborales",
        "✅ Gestión completa de postulaciones y candidatos",
        "✅ Sistema de notificaciones para eventos importantes",
        "✅ Generación de reportes en PDF",
        "✅ Interfaz responsiva compatible con móvil, tablet y desktop",
        "✅ Diseño profesional y empresarial",
        "✅ Sistema de evaluación de candidatos",
        "✅ Estadísticas y analytics del sistema"
    ]
    
    for feature in features:
        doc.add_paragraph(feature, style='List Bullet')
    
    add_heading_style(doc, "2.2 Tecnologías Utilizadas", level=2)
    
    data = [
        ("Frontend", "Next.js 15.5.15 con App Router, React"),
        ("Backend", "NestJS 10.0.0, Express"),
        ("Base de Datos", "PostgreSQL con Prisma ORM"),
        ("Autenticación", "JWT + Bcrypt")
    ]
    
    tech_table = doc.add_table(rows=len(data)+1, cols=2)
    tech_table.style = 'Light Grid Accent 1'
    
    header_cells = tech_table.rows[0].cells
    header_cells[0].text = "Componente"
    header_cells[1].text = "Tecnología"
    
    shade_cell(header_cells[0], "1a365d")
    shade_cell(header_cells[1], "1a365d")
    for cell in header_cells:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.bold = True
    
    for i, (component, tech) in enumerate(data, 1):
        row_cells = tech_table.rows[i].cells
        row_cells[0].text = component
        row_cells[1].text = tech
    
    doc.add_page_break()
    
    # ========== 3. INICIO RÁPIDO ==========
    add_heading_style(doc, "3. Guía de Inicio Rápido", level=1)
    
    add_heading_style(doc, "3.1 Acceso a la Plataforma", level=2)
    
    steps = [
        "Abre tu navegador web favorito (Chrome, Firefox, Edge, Safari)",
        "Dirígete a la URL de la plataforma (será proporcionada por tu institución)",
        "Deberías ver la página de inicio con opciones de Login y Registro"
    ]
    
    for i, step in enumerate(steps, 1):
        p = doc.add_paragraph(f"{i}. {step}")
    
    add_heading_style(doc, "3.2 Crear una Cuenta (Registro)", level=2)
    
    reg_steps = [
        ("Haz clic en el botón 'Registrarse'", 
         "Verás un formulario con opciones de rol."),
        ("Selecciona tu rol: Egresado o Empresa", 
         "Empresas seleccionan 'Empresa', graduados seleccionan 'Egresado'."),
        ("Completa todos los campos obligatorios", 
         "Nombre, Email, Contraseña, y datos específicos del rol."),
        ("Lee y acepta los términos y condiciones", 
         "Marca el checkbox correspondiente."),
        ("Haz clic en 'Crear Cuenta'", 
         "Se crea automáticamente tu perfil y puedes iniciar sesión."),
    ]
    
    for title, desc in reg_steps:
        p = doc.add_paragraph(title, style='List Number')
        p.paragraph_format.left_indent = Inches(0.25)
        doc.add_paragraph(desc)
    
    add_heading_style(doc, "3.3 Iniciar Sesión", level=2)
    
    login_steps = [
        "Haz clic en 'Iniciar Sesión' en la página de inicio",
        "Ingresa tu correo electrónico registrado",
        "Ingresa tu contraseña",
        "Haz clic en 'Ingresar'",
        "Serás redirigido al dashboard personalizado según tu rol"
    ]
    
    for i, step in enumerate(login_steps, 1):
        doc.add_paragraph(step, style='List Number')
    
    add_paragraph_style(doc, "💡 Consejo: Tu sesión se mantiene activa en el navegador. Para cerrar sesión, busca la opción 'Cerrar Sesión' en el menú de perfil (esquina superior derecha).")
    
    doc.add_page_break()
    
    # ========== 4. LOS TRES ROLES ==========
    add_heading_style(doc, "4. Los Tres Roles del Sistema", level=1)
    
    # Egresado
    add_heading_style(doc, "4.1 Egresado (👨‍🎓)", level=2)
    add_paragraph_style(doc, "Un egresado es un profesional que se ha graduado de la universidad y está buscando oportunidades laborales.")
    
    add_heading_style(doc, "Responsabilidades principales:", level=3)
    responsibilities = [
        "Mantener un perfil profesional actualizado",
        "Explorar y postular a ofertas laborales",
        "Participar en evaluaciones de candidatos",
        "Seguimiento de postulaciones enviadas",
        "Contactar con empresas interesadas"
    ]
    for resp in responsibilities:
        doc.add_paragraph(resp, style='List Bullet')
    
    # Empresa
    add_heading_style(doc, "4.2 Empresa (🏢)", level=2)
    add_paragraph_style(doc, "Una empresa es una organización que busca contratar talento de egresados universitarios.")
    
    add_heading_style(doc, "Responsabilidades principales:", level=3)
    for resp in [
        "Mantener información empresarial actualizada",
        "Publicar y gestionar ofertas laborales",
        "Revisar candidaturas de egresados",
        "Evaluar a candidatos",
        "Hacer seguimiento de contrataciones"
    ]:
        doc.add_paragraph(resp, style='List Bullet')
    
    # Admin
    add_heading_style(doc, "4.3 Administrador (🔧)", level=2)
    add_paragraph_style(doc, "El administrador tiene control total del sistema y es responsable de gestionar usuarios, contenido y configuraciones.")
    
    add_heading_style(doc, "Responsabilidades principales:", level=3)
    for resp in [
        "Administrar todos los usuarios del sistema",
        "Gestionar ofertas laborales",
        "Generar reportes y estadísticas",
        "Monitorear la actividad del sistema",
        "Bloquear o desactivar usuarios si es necesario",
        "Configurar parámetros del sistema"
    ]:
        doc.add_paragraph(resp, style='List Bullet')
    
    doc.add_page_break()
    
    # ========== 5. FUNCIONALIDADES POR ROL ==========
    add_heading_style(doc, "5. Matriz de Permisos y Funcionalidades", level=1)
    
    # Create permissions table
    perm_table = doc.add_table(rows=8, cols=4)
    perm_table.style = 'Light Grid Accent 1'
    
    # Header
    header_cells = perm_table.rows[0].cells
    headers = ["Funcionalidad", "Egresado", "Empresa", "Admin"]
    for i, header_text in enumerate(headers):
        header_cells[i].text = header_text
        shade_cell(header_cells[i], "1a365d")
        for paragraph in header_cells[i].paragraphs:
            for run in paragraph.runs:
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.bold = True
    
    # Data rows
    permissions = [
        ("Ver su perfil", "✅", "✅", "✅"),
        ("Crear/editar ofertas", "❌", "✅", "✅"),
        ("Postular a ofertas", "✅", "❌", "❌"),
        ("Ver candidatos", "❌", "✅", "✅"),
        ("Evaluar candidatos", "❌", "✅", "✅"),
        ("Generar reportes", "✅", "✅", "✅"),
        ("Gestionar usuarios", "❌", "❌", "✅"),
    ]
    
    for i, (func, eg, em, ad) in enumerate(permissions, 1):
        row_cells = perm_table.rows[i].cells
        row_cells[0].text = func
        row_cells[1].text = eg
        row_cells[2].text = em
        row_cells[3].text = ad
    
    doc.add_page_break()
    
    # ========== 6. FLUJO DE AUTENTICACIÓN ==========
    add_heading_style(doc, "6. Flujo de Autenticación y Seguridad", level=1)
    
    add_heading_style(doc, "6.1 ¿Cómo funciona la seguridad?", level=2)
    
    security_points = [
        ("Contraseñas Encriptadas", "Las contraseñas se encriptan usando Bcrypt. Ni siquiera los administradores pueden ver tu contraseña."),
        ("JWT Tokens", "Cuando inicias sesión, recibes un token seguro que identifica tu sesión sin revelar tu contraseña."),
        ("Almacenamiento Seguro", "El token se guarda localmente en tu navegador (localStorage) para mantener tu sesión activa."),
        ("Sesiones Seguras", "Si cierras sesión o tu navegador se reinicia, debes ingresar tus credenciales de nuevo."),
    ]
    
    for title, desc in security_points:
        p = doc.add_paragraph()
        p.add_run(f"{title}: ").bold = True
        p.add_run(desc)
    
    add_heading_style(doc, "6.2 ¿Olvidé mi contraseña?", level=2)
    
    forgot_steps = [
        "En la página de login, haz clic en '¿Olvidaste tu contraseña?'",
        "Ingresa el correo electrónico asociado a tu cuenta",
        "Recibirás un enlace de recuperación en tu email",
        "Haz clic en el enlace y crea una nueva contraseña",
        "Regresa al login e ingresa con tu nueva contraseña"
    ]
    
    for i, step in enumerate(forgot_steps, 1):
        doc.add_paragraph(step, style='List Number')
    
    doc.add_page_break()
    
    # ========== 7. GUÍA EGRESADO ==========
    add_heading_style(doc, "7. Guía Completa para Egresados", level=1)
    
    add_heading_style(doc, "7.1 Crear y Completar tu Perfil", level=2)
    
    profile_steps = [
        ("Después de registrarte y iniciar sesión", 
         "Verás el dashboard del egresado."),
        ("Haz clic en 'Mi Perfil' en la barra de navegación", 
         "Se abrirá la página de tu perfil profesional."),
        ("Completa todos los campos:", 
         "Nombre, resumen profesional, teléfono, skills, educación, experiencia."),
        ("Agrega tu foto de perfil", 
         "Una foto profesional mejora tu candidatura."),
        ("Lista tus competencias principales", 
         "Estas se mostrarán cuando las empresas busquen candidatos."),
        ("Guarda los cambios", 
         "Haz clic en el botón 'Guardar' para asegurar que tus cambios se registren."),
    ]
    
    for title, desc in profile_steps:
        p = doc.add_paragraph(title, style='List Number')
        p.paragraph_format.left_indent = Inches(0.25)
        doc.add_paragraph(desc)
    
    add_heading_style(doc, "7.2 Buscar y Explorar Ofertas Laborales", level=2)
    
    search_steps = [
        "En el menú lateral izquierdo, haz clic en 'Ofertas'",
        "Verás un listado de todas las ofertas laborales disponibles",
        "Puedes usar filtros para buscar por:",
        "  • Empresa",
        "  • Tipo de puesto",
        "  • Rango salarial",
        "  • Ubicación",
        "Haz clic en una oferta para ver los detalles completos"
    ]
    
    for i, step in enumerate(search_steps, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "7.3 Postularse a una Oferta", level=2)
    
    apply_steps = [
        "Encuentra la oferta que te interesa",
        "Haz clic en el botón 'Postularse' en la página de detalles",
        "Se abrirá un formulario con opción de agregar una carta de presentación",
        "Escribe un mensaje personalizado (opcional pero recomendado)",
        "Haz clic en 'Enviar Postulación'",
        "Recibirás una confirmación de que tu postulación fue enviada",
        "La empresa recibirá notificación de tu interés"
    ]
    
    for i, step in enumerate(apply_steps, 1):
        doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "7.4 Seguimiento de Postulaciones", level=2)
    
    follow_steps = [
        "Haz clic en 'Mis Postulaciones' en el menú lateral",
        "Verás todas las postulaciones que has enviado",
        "Para cada postulación puedes ver:",
        "  • Estado actual (Postulado, En revisión, Entrevista, Contratado, Rechazado)",
        "  • Fecha de postulación",
        "  • Información de la empresa",
        "  • Cualquier comentario de la empresa"
    ]
    
    for i, step in enumerate(follow_steps, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "7.5 Recibir Evaluaciones", level=2)
    
    add_paragraph_style(doc, 
        "Cuando una empresa te evalúa, recibirás una notificación. Puedes ver tus evaluaciones en la sección "
        "'Historial de Evaluaciones' de tu perfil. Cada evaluación incluirá:"
    )
    
    eval_items = [
        "Puntuación general (1-10)",
        "Evaluación por competencia (Técnica, Comunicación, Proactividad)",
        "Comentarios de la empresa",
        "Fecha de evaluación"
    ]
    
    for item in eval_items:
        doc.add_paragraph(item, style='List Bullet')
    
    doc.add_page_break()
    
    # ========== 8. GUÍA EMPRESA ==========
    add_heading_style(doc, "8. Guía Completa para Empresas", level=1)
    
    add_heading_style(doc, "8.1 Crear y Completar tu Perfil Empresarial", level=2)
    
    company_profile = [
        "Después de registrarte e iniciar sesión como Empresa",
        "Ve a 'Mi Empresa' en el menú lateral",
        "Completa la información empresarial:",
        "  • Nombre de la empresa",
        "  • Descripción y misión",
        "  • Sitio web",
        "  • Teléfono de contacto",
        "  • Ubicación y oficinas",
        "  • Logo de la empresa",
        "Haz clic en 'Guardar Cambios'"
    ]
    
    for i, step in enumerate(company_profile, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "8.2 Crear una Nueva Oferta Laboral", level=2)
    
    create_offer = [
        ("Haz clic en 'Mis Ofertas' en el menú lateral", 
         "Verás un listado de todas tus ofertas actuales."),
        ("Haz clic en el botón '+ Nueva Oferta'", 
         "Se abrirá un formulario para crear la oferta."),
        ("Completa los detalles de la oferta:", 
         "Título del puesto, descripción, requisitos, beneficios, salario, ubicación, deadline."),
        ("Agrega las competencias requeridas", 
         "Estas se usarán para filtrar candidatos compatibles."),
        ("Revisa y haz clic en 'Publicar Oferta'", 
         "La oferta estará visible para todos los egresados registrados."),
    ]
    
    for title, desc in create_offer:
        p = doc.add_paragraph(title, style='List Number')
        p.paragraph_format.left_indent = Inches(0.25)
        doc.add_paragraph(desc)
    
    add_heading_style(doc, "8.3 Gestionar Candidatos", level=2)
    
    manage_cand = [
        "Haz clic en 'Mis Ofertas' y selecciona una oferta",
        "Verás un listado de candidatos que se han postulado",
        "Para cada candidato puedes:",
        "  • Ver su perfil completo (haz clic en su nombre)",
        "  • Revisar su resumen profesional y experiencia",
        "  • Ver sus competencias",
        "  • Cambiar el estado de la postulación",
        "  • Dejar comentarios y observaciones",
        "  • Enviar mensajes al candidato"
    ]
    
    for i, step in enumerate(manage_cand, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "8.4 Evaluar Candidatos", level=2)
    
    eval_cand = [
        "En la página del perfil del candidato, haz clic en '+ Agregar Evaluación'",
        "Se abrirá un formulario con espacios para calificar competencias",
        "Evalúa al candidato en:",
        "  • Técnica (conocimientos técnicos del puesto)",
        "  • Comunicación (habilidades comunicacionales)",
        "  • Proactividad (iniciativa e independencia)",
        "Asigna una puntuación de 1 a 10 para cada competencia",
        "Agrega comentarios sobre el candidato",
        "Haz clic en 'Enviar Evaluación'",
        "El candidato recibirá una notificación sobre su evaluación"
    ]
    
    for i, step in enumerate(eval_cand, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "8.5 Estados de Postulaciones", level=2)
    
    add_paragraph_style(doc, "Durante el proceso de selección, puedes cambiar el estado de cada postulación:")
    
    states_data = [
        ("Postulado", "Estado inicial cuando un candidato se postula"),
        ("En revisión", "Estás revisando el perfil del candidato"),
        ("Entrevista", "Invitaste al candidato a una entrevista"),
        ("Contratado", "El candidato fue contratado"),
        ("Rechazado", "No avanzó en el proceso de selección"),
    ]
    
    for state, desc in states_data:
        p = doc.add_paragraph()
        p.add_run(f"• {state}: ").bold = True
        p.add_run(desc)
    
    add_heading_style(doc, "8.6 Generar Reportes", level=2)
    
    add_paragraph_style(doc, 
        "En la sección 'Reportes', puedes generar reportes sobre tu actividad de reclutamiento, "
        "incluyendo:"
    )
    
    reports = [
        "Número total de postulaciones por oferta",
        "Candidatos en cada estado del proceso",
        "Estadísticas de tiempo promedio de selección",
        "Descargas en formato PDF"
    ]
    
    for report in reports:
        doc.add_paragraph(report, style='List Bullet')
    
    doc.add_page_break()
    
    # ========== 9. GUÍA ADMINISTRADOR ==========
    add_heading_style(doc, "9. Guía Completa para Administradores", level=1)
    
    add_heading_style(doc, "9.1 Acceso al Panel de Administración", level=2)
    
    admin_access = [
        "Cuando inicias sesión como Administrador, accedes automáticamente al panel admin",
        "En el menú lateral izquierdo verás opciones específicas de admin:",
        "  • Dashboard",
        "  • Gestión de Egresados",
        "  • Gestión de Empresas",
        "  • Gestión de Ofertas",
        "  • Reportes del Sistema",
        "  • Configuración"
    ]
    
    for i, step in enumerate(admin_access, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "9.2 Dashboard Administrativo", level=2)
    
    add_paragraph_style(doc, 
        "El dashboard proporciona una vista general del sistema con KPIs (Key Performance Indicators):"
    )
    
    kpis = [
        "Total de egresados registrados",
        "Total de empresas registradas",
        "Ofertas laborales activas",
        "Postulaciones en proceso",
        "Tasa de contratación",
        "Actividad reciente del sistema"
    ]
    
    for kpi in kpis:
        doc.add_paragraph(kpi, style='List Bullet')
    
    add_heading_style(doc, "9.3 Gestionar Egresados", level=2)
    
    manage_egr = [
        "Haz clic en 'Egresados' en el menú admin",
        "Verás un listado de todos los egresados registrados",
        "Puedes:",
        "  • Buscar egresados por nombre o email",
        "  • Ver perfiles completos",
        "  • Bloquear/desbloquear cuentas si es necesario",
        "  • Eliminar cuentas (con cuidado)",
        "  • Exportar datos",
        "  • Ver historial de actividades del usuario"
    ]
    
    for i, step in enumerate(manage_egr, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "9.4 Gestionar Empresas", level=2)
    
    manage_emp = [
        "Haz clic en 'Empresas' en el menú admin",
        "Verás el listado de todas las empresas registradas",
        "Funcionalidades similares a la gestión de egresados:",
        "  • Buscar por nombre de empresa",
        "  • Ver información completa",
        "  • Bloquear/desbloquear empresas",
        "  • Revisar ofertas publicadas",
        "  • Ver historial de actividades"
    ]
    
    for i, step in enumerate(manage_emp, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "9.5 Gestionar Ofertas Laborales", level=2)
    
    manage_offers = [
        "Haz clic en 'Ofertas' en el menú admin",
        "Verás todas las ofertas laborales en el sistema",
        "Puedes:",
        "  • Aprobar o rechazar nuevas ofertas",
        "  • Editar detalles de ofertas",
        "  • Cerrar ofertas manualmente",
        "  • Ver estadísticas de cada oferta",
        "  • Filtrar por estado (Activa, Cerrada, Pendiente de aprobación)"
    ]
    
    for i, step in enumerate(manage_offers, 1):
        if step.startswith("  •"):
            doc.add_paragraph(step)
        else:
            doc.add_paragraph(step, style='List Number')
    
    add_heading_style(doc, "9.6 Reportes del Sistema", level=2)
    
    add_paragraph_style(doc, 
        "La sección de Reportes permite generar análisis detallados sobre el sistema:"
    )
    
    sys_reports = [
        "Reporte de Empleabilidad: Egresados contratados vs. sin contratar",
        "Reporte de Empresas: Actividad de reclutamiento por empresa",
        "Reporte de Competencias: Competencias más solicitadas",
        "Reporte Temporal: Análisis por período de tiempo",
        "Exportación de Datos: Descarga de datos en formato Excel/PDF"
    ]
    
    for report in sys_reports:
        doc.add_paragraph(report, style='List Bullet')
    
    doc.add_page_break()
    
    # ========== 10. PREGUNTAS FRECUENTES ==========
    add_heading_style(doc, "10. Preguntas Frecuentes (FAQ)", level=1)
    
    faqs = [
        ("¿Es gratuito el uso del sistema?",
         "Sí, el sistema es gratuito para egresados y empresas registradas en la universidad."),
        ("¿Cuánto tiempo puedo mantener mi cuenta activa?",
         "Tu cuenta es permanente mientras cumplas con las políticas del sistema."),
        ("¿Puedo cambiar mi rol después de registrarme?",
         "No, el rol se asigna en el registro y es permanente. Si necesitas cambiar, contacta al administrador."),
        ("¿Cómo puedo editar mis datos después de registrarme?",
         "Ve a tu perfil, haz los cambios necesarios y haz clic en 'Guardar'."),
        ("¿Cuántas ofertas puede publicar una empresa?",
         "No hay límite de ofertas que pueda publicar una empresa."),
        ("¿Puedo postularme a la misma oferta dos veces?",
         "No, el sistema solo permite una postulación por oferta por egresado."),
        ("¿Cuándo recibo notificación sobre cambios en mi postulación?",
         "Recibirás notificaciones en tiempo real cuando la empresa actualice el estado de tu postulación."),
        ("¿Cómo puedo contactar a una empresa?",
         "Puedes dejar comentarios en el perfil del candidato o usar el sistema de mensajes."),
        ("¿Qué debo hacer si olvidé mi contraseña?",
         "Usa la opción '¿Olvidaste tu contraseña?' en la página de login para restablecerla."),
        ("¿Es segura mi información personal?",
         "Sí, usamos encriptación estándar de la industria para proteger tus datos."),
    ]
    
    for i, (question, answer) in enumerate(faqs, 1):
        p = doc.add_paragraph()
        p.add_run(f"P{i}: {question}").bold = True
        doc.add_paragraph(f"R: {answer}")
    
    doc.add_page_break()
    
    # ========== 11. SOPORTE Y CONTACTO ==========
    add_heading_style(doc, "11. Soporte y Contacto", level=1)
    
    add_heading_style(doc, "11.1 ¿Necesitas ayuda?", level=2)
    
    support_para = doc.add_paragraph(
        "Si encuentras problemas o tienes preguntas adicionales, aquí están los canales de soporte disponibles:"
    )
    
    support_channels = [
        ("Email de Soporte", "support@universidad.edu"),
        ("Teléfono", "+1-XXX-XXX-XXXX"),
        ("Horario de Atención", "Lunes a viernes, 9:00 AM - 5:00 PM"),
        ("Portal de Ayuda", "https://ayuda.universidad.edu"),
    ]
    
    for channel, info in support_channels:
        p = doc.add_paragraph()
        p.add_run(f"• {channel}: ").bold = True
        p.add_run(info)
    
    add_heading_style(doc, "11.2 Errores Comunes y Soluciones", level=2)
    
    errors = [
        ("No puedo iniciar sesión",
         "Verifica que el email sea correcto. Si olvidaste la contraseña, usa 'Recuperar Contraseña'."),
        ("Dice que mi email ya está registrado",
         "Es posible que ya tengas una cuenta. Intenta iniciar sesión o recuperar tu contraseña."),
        ("La página no carga correctamente",
         "Intenta limpiar el caché del navegador (Ctrl+Shift+Del) y recarga la página."),
        ("No recibo notificaciones",
         "Verifica que el navegador tenga permisos de notificación habilitados."),
        ("Mi oferta no se publica",
         "Asegúrate de llenar todos los campos obligatorios y que la oferta sea válida."),
    ]
    
    for error, solution in errors:
        p = doc.add_paragraph()
        p.add_run(f"• {error}: ").bold = True
        p.add_run(solution)
    
    add_heading_style(doc, "11.3 Políticas Importantes", level=2)
    
    policies = [
        "Respeta los términos de uso del sistema",
        "No publiques contenido ofensivo o discriminatorio",
        "Mantén tu información personal actualizada",
        "Reporta cuentas sospechosas al administrador",
        "Respeta la privacidad de otros usuarios",
        "No compartas tu contraseña con terceros",
        "Los datos pueden ser eliminados si violás las políticas"
    ]
    
    for policy in policies:
        doc.add_paragraph(policy, style='List Bullet')
    
    doc.add_page_break()
    
    # ========== CONCLUSIÓN ==========
    add_heading_style(doc, "Conclusión", level=1)
    
    conclusion = """
Este manual cubre todas las funcionalidades principales del Sistema de Egresados y Oferta Laboral. 
Esperamos que te resulte útil para navegar la plataforma de manera efectiva.

Recuerda que el sistema está diseñado para facilitarte la conexión entre talento y oportunidades laborales. 
Si eres egresado, aprovecha la plataforma para encontrar tu empleo ideal. Si eres empresa, usa el sistema 
para encontrar los mejores talentos. Si eres administrador, mantén el sistema funcionando de manera óptima.

Para preguntas adicionales o problemas, no dudes en contactar al equipo de soporte.

¡Bienvenido al Sistema de Egresados y Oferta Laboral!
    """
    
    doc.add_paragraph(conclusion)
    
    # ========== ANEXOS ==========
    doc.add_page_break()
    
    add_heading_style(doc, "Anexo A: Glosario de Términos", level=1)
    
    glossary = [
        ("Egresado", "Profesional que se ha graduado de la universidad."),
        ("JWT", "JSON Web Token - Token de autenticación segura."),
        ("Bcrypt", "Sistema de encriptación de contraseñas."),
        ("Dashboard", "Página principal con estadísticas e información."),
        ("KPI", "Key Performance Indicator - Indicador de desempeño."),
        ("CMS", "Sistema de gestión de contenidos."),
        ("API", "Interfaz de programación de aplicaciones."),
        ("Backend", "Servidor y lógica del sistema."),
        ("Frontend", "Interfaz de usuario visible en el navegador."),
        ("ORM", "Object-Relational Mapping - Mapeo de objetos a bases de datos."),
    ]
    
    glossary_table = doc.add_table(rows=len(glossary)+1, cols=2)
    glossary_table.style = 'Light Grid Accent 1'
    
    header_cells = glossary_table.rows[0].cells
    header_cells[0].text = "Término"
    header_cells[1].text = "Definición"
    
    shade_cell(header_cells[0], "1a365d")
    shade_cell(header_cells[1], "1a365d")
    for cell in header_cells:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.bold = True
    
    for i, (term, definition) in enumerate(glossary, 1):
        row_cells = glossary_table.rows[i].cells
        row_cells[0].text = term
        row_cells[1].text = definition
    
    return doc

if __name__ == "__main__":
    print("🚀 Generando manual de usuario...")
    doc = create_manual()
    
    output_path = "Manual_de_Usuario_Sistema_Egresados_Oferta_Laboral.docx"
    doc.save(output_path)
    
    print(f"✅ Manual creado exitosamente: {output_path}")
    print(f"📄 Documento: {output_path}")
