"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostulacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let PostulacionesService = class PostulacionesService {
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    toDateKey(value) {
        if (!value)
            return null;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime()))
            return null;
        return date.toISOString().slice(0, 10);
    }
    formatInterviewDate(fecha) {
        const date = new Date(`${fecha}T00:00:00`);
        if (Number.isNaN(date.getTime()))
            return fecha;
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    async sendInterviewEmail(params) {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailFrom = process.env.EMAIL_FROM || emailUser;
        if (!emailUser || !emailPass) {
            console.warn('⚠️ EMAIL_USER o EMAIL_PASS no configurados. Se omite envio de correo de entrevista.');
            return;
        }
        try {
            const nodemailer = await import('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            const fechaLegible = this.formatInterviewDate(params.entrevistaFecha);
            const saludo = params.nombres ? `Hola ${params.nombres},` : 'Hola,';
            const comentarioHtml = params.comentario ? `<p><strong>Detalle:</strong> ${params.comentario}</p>` : '';
            console.log(`📧 Remitente configurado: ${emailFrom} | Destinatario: ${params.to}`);
            // Crear una promesa de timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout enviando correo (10s)')), 10000));
            // Enviar correo con timeout
            const sendPromise = transporter.sendMail({
                from: `Sistema de Egresados <${emailFrom}>`,
                to: params.to,
                subject: `Entrevista programada - ${params.ofertaTitulo}`,
                text: `${saludo}\n\nTu postulación para "${params.ofertaTitulo}" pasó a entrevista.\nFecha: ${fechaLegible}\nHora: ${params.entrevistaHora}\n${params.comentario ? `Detalle: ${params.comentario}\n` : ''}\nÉxitos en tu entrevista.`,
                html: `
          <p>${saludo}</p>
          <p>Tu postulación para <strong>${params.ofertaTitulo}</strong> pasó a entrevista.</p>
          <p><strong>Fecha:</strong> ${fechaLegible}<br/><strong>Hora:</strong> ${params.entrevistaHora}</p>
          ${comentarioHtml}
          <p>Éxitos en tu entrevista.</p>
        `,
            });
            await Promise.race([sendPromise, timeoutPromise]);
        }
        catch (err) {
            console.error('❌ Error en sendInterviewEmail:', err instanceof Error ? err.message : String(err));
            throw err;
        }
    }
    async create(egresadoId, ofertaId) {
        const prisma = this.prisma;
        // 0. Validar formato de UUIDs para evitar errores de Prisma
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(egresadoId) || !uuidRegex.test(ofertaId)) {
            throw new common_1.BadRequestException('Los identificadores de egresado u oferta no son válidos');
        }
        try {
            // 1. Verificar si ya existe la postulación
            const existente = await prisma.postulacion.findFirst({
                where: {
                    egresadoId,
                    ofertaId
                }
            });
            if (existente) {
                throw new common_1.BadRequestException('Ya te has postulado a esta oferta laboral');
            }
            const oferta = await prisma.ofertaLaboral.findUnique({
                where: { id: ofertaId },
                select: {
                    id: true,
                    titulo: true,
                    fechaPublicacion: true,
                },
            });
            if (!oferta) {
                throw new common_1.BadRequestException('La oferta laboral no existe');
            }
            const hoy = new Date().toISOString().slice(0, 10);
            const fechaPublicacion = this.toDateKey(oferta.fechaPublicacion);
            if (fechaPublicacion && fechaPublicacion > hoy) {
                const fechaPublicacionLegible = new Date(`${fechaPublicacion}T00:00:00Z`).toLocaleDateString('es-PE');
                throw new common_1.BadRequestException(`Las postulaciones para esta oferta inician el ${fechaPublicacionLegible} y todavía no están habilitadas`);
            }
            // 2. Crear la postulación
            const postulacion = await prisma.postulacion.create({
                data: {
                    egresadoId,
                    ofertaId,
                    estado: 'postulado', // Usar minúsculas como en el default del schema
                },
                include: {
                    oferta: {
                        include: { empresa: true }
                    },
                    egresado: true,
                },
            });
            // 3. Notificar a la empresa
            try {
                if (postulacion.oferta?.empresaId) {
                    await this.notificacionesService.create({
                        userId: postulacion.oferta.empresaId,
                        titulo: 'Nuevo Postulante',
                        mensaje: `Has recibido una nueva postulación para la oferta: ${postulacion.oferta.titulo}`,
                        tipo: 'interna',
                    });
                }
            }
            catch (notifError) {
                console.error('Error al enviar notificación de postulación:', notifError);
            }
            return postulacion;
        }
        catch (error) {
            console.error('Error en PostulacionesService.create:', error);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al registrar la postulación en la base de datos');
        }
    }
    async findByEgresado(egresadoId) {
        return this.prisma.postulacion.findMany({
            where: { egresadoId },
            include: {
                oferta: { include: { empresa: true } },
                historial: {
                    orderBy: { fechaCambio: 'desc' }
                }
            },
            orderBy: { fechaPostulacion: 'desc' },
        });
    }
    async findByEmpresa(empresaId) {
        return this.prisma.postulacion.findMany({
            where: { oferta: { empresaId } },
            include: {
                egresado: {
                    include: {
                        user: { select: { email: true } },
                        egresadoHabilidades: { include: { habilidad: true } },
                        experienciasLaborales: true,
                        formacionesAcademicas: true,
                    }
                },
                oferta: true,
                historial: {
                    orderBy: { fechaCambio: 'desc' }
                }
            },
            orderBy: { fechaPostulacion: 'desc' },
        });
    }
    async updateStatus(id, estado, motivo, entrevistaFecha, entrevistaHora) {
        const prisma = this.prisma;
        const estadoNormalizado = estado?.trim().toLowerCase();
        const estaContratado = estadoNormalizado === 'contratado';
        const esEntrevista = estadoNormalizado === 'entrevista';
        if (esEntrevista && (!entrevistaFecha || !entrevistaHora)) {
            throw new common_1.BadRequestException('Para programar entrevista debe ingresar fecha y hora');
        }
        const motivoFinal = motivo || `Cambio de estado a ${estado}`;
        const motivoConEntrevista = esEntrevista
            ? `${motivoFinal}. Entrevista programada para ${this.formatInterviewDate(entrevistaFecha)} a las ${entrevistaHora}.`
            : motivoFinal;
        // 1. Obtener estado anterior
        const actual = await prisma.postulacion.findUnique({
            where: { id },
            select: { estado: true, egresadoId: true, ofertaId: true }
        });
        if (!actual) {
            throw new common_1.BadRequestException('La postulación no existe');
        }
        // 2. Actualizar estado y crear historial en una transacción
        const postulacion = await prisma.$transaction(async (tx) => {
            const updated = await tx.postulacion.update({
                where: { id },
                data: {
                    estado,
                    comentario: motivoConEntrevista,
                },
                include: {
                    oferta: true,
                },
            });
            if (actual.egresadoId) {
                if (estaContratado) {
                    await tx.egresado.update({
                        where: { id: actual.egresadoId },
                        data: { empleadoActualmente: true },
                    });
                }
                else {
                    const otraContratacion = await tx.postulacion.findFirst({
                        where: {
                            egresadoId: actual.egresadoId,
                            estado: 'contratado',
                            id: { not: id },
                        },
                        select: { id: true },
                    });
                    await tx.egresado.update({
                        where: { id: actual.egresadoId },
                        data: { empleadoActualmente: !!otraContratacion },
                    });
                }
            }
            await tx.historialEstadoPostulacion.create({
                data: {
                    postulacionId: id,
                    estadoAnterior: actual.estado,
                    estadoNuevo: estado,
                    motivo: motivoConEntrevista,
                }
            });
            return updated;
        });
        // 3. Notificar al egresado
        try {
            console.log(`📨 Creando notificación para egresado ${postulacion.egresadoId}`);
            await this.notificacionesService.create({
                userId: postulacion.egresadoId,
                titulo: 'Actualización de Postulación',
                mensaje: `Tu postulación para "${postulacion.oferta.titulo}" ha cambiado al estado: ${estado}`,
                tipo: 'interna',
            });
            console.log(`✅ Notificación creada`);
            if (esEntrevista && entrevistaFecha && entrevistaHora) {
                console.log(`🎯 Estado es entrevista, buscando egresado ${postulacion.egresadoId}`);
                const egresado = await prisma.egresado.findUnique({
                    where: { id: postulacion.egresadoId },
                    include: {
                        user: {
                            select: { email: true },
                        },
                    },
                });
                console.log(`👤 Egresado encontrado:`, egresado?.user?.email);
                // Validar que el email sea un email real (no local fake como egresado@sego.local)
                const email = egresado?.user?.email;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const emailValido = !!email &&
                    emailRegex.test(email) &&
                    !email.includes('sego.local') &&
                    !email.includes('local') &&
                    !email.includes('@local');
                console.log(`📧 Validación de email: ${emailValido} (${email})`);
                if (emailValido) {
                    console.log(`📤 Enviando correo de entrevista a ${egresado.user.email}...`);
                    await this.sendInterviewEmail({
                        to: egresado.user.email,
                        nombres: egresado.nombres,
                        ofertaTitulo: postulacion.oferta.titulo,
                        entrevistaFecha,
                        entrevistaHora,
                        comentario: motivo,
                    });
                    console.log(`✅ Correo de entrevista enviado a ${egresado.user.email}`);
                }
                else {
                    console.warn(`⚠️ Email inválido o de prueba para egresado ${postulacion.egresadoId}: ${email}`);
                }
            }
            else {
                console.log(`⏭️ No es entrevista o faltan datos: esEntrevista=${esEntrevista}, fecha=${entrevistaFecha}, hora=${entrevistaHora}`);
            }
        }
        catch (error) {
            console.error('Error al enviar notificación:', error);
        }
        return postulacion;
    }
};
exports.PostulacionesService = PostulacionesService;
exports.PostulacionesService = PostulacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], PostulacionesService);
