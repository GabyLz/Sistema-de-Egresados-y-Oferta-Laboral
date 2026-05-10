import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class PostulacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private toDateKey(value?: Date | string | null) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }

  private formatInterviewDate(fecha: string) {
    const date = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) return fecha;
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private async sendInterviewEmail(params: {
    to: string;
    nombres?: string;
    ofertaTitulo: string;
    entrevistaFecha: string;
    entrevistaHora: string;
    comentario?: string;
  }) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

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

      // Crear una promesa de timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout enviando correo (10s)')), 10000)
      );

      // Enviar correo con timeout
      const sendPromise = transporter.sendMail({
        from: `Sistema de Egresados <${emailUser}>`,
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
    } catch (err) {
      console.error('❌ Error en sendInterviewEmail:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  async create(egresadoId: string, ofertaId: string) {
    const prisma: any = this.prisma;
    
    // 0. Validar formato de UUIDs para evitar errores de Prisma
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(egresadoId) || !uuidRegex.test(ofertaId)) {
      throw new BadRequestException('Los identificadores de egresado u oferta no son válidos');
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
        throw new BadRequestException('Ya te has postulado a esta oferta laboral');
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
        throw new BadRequestException('La oferta laboral no existe');
      }

      const hoy = new Date().toISOString().slice(0, 10);
      const fechaPublicacion = this.toDateKey(oferta.fechaPublicacion);

      if (fechaPublicacion && fechaPublicacion > hoy) {
        const fechaPublicacionLegible = new Date(`${fechaPublicacion}T00:00:00Z`).toLocaleDateString('es-PE');
        throw new BadRequestException(
          `Las postulaciones para esta oferta inician el ${fechaPublicacionLegible} y todavía no están habilitadas`,
        );
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
      } catch (notifError) {
        console.error('Error al enviar notificación de postulación:', notifError);
      }

      return postulacion;
    } catch (error) {
      console.error('Error en PostulacionesService.create:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al registrar la postulación en la base de datos');
    }
  }

  async findByEgresado(egresadoId: string) {
    return (this.prisma as any).postulacion.findMany({
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

  async findByEmpresa(empresaId: string) {
    return (this.prisma as any).postulacion.findMany({
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

  async updateStatus(id: string, estado: string, motivo?: string, entrevistaFecha?: string, entrevistaHora?: string) {
    const prisma: any = this.prisma;
    const estadoNormalizado = estado?.trim().toLowerCase();
    const estaContratado = estadoNormalizado === 'contratado';
    const esEntrevista = estadoNormalizado === 'entrevista';

    if (esEntrevista && (!entrevistaFecha || !entrevistaHora)) {
      throw new BadRequestException('Para programar entrevista debe ingresar fecha y hora');
    }
    const motivoFinal = motivo || `Cambio de estado a ${estado}`;
    const motivoConEntrevista = esEntrevista
      ? `${motivoFinal}. Entrevista programada para ${this.formatInterviewDate(entrevistaFecha as string)} a las ${entrevistaHora}.`
      : motivoFinal;
    
    // 1. Obtener estado anterior
    const actual = await prisma.postulacion.findUnique({
      where: { id },
      select: { estado: true, egresadoId: true, ofertaId: true }
    });

    if (!actual) {
      throw new BadRequestException('La postulación no existe');
    }

    // 2. Actualizar estado y crear historial en una transacción
    const postulacion = await prisma.$transaction(async (tx: any) => {
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
        } else {
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
          // Enviar correo en background SIN bloquear la respuesta del PATCH
          this.sendInterviewEmail({
            to: egresado.user.email,
            nombres: egresado.nombres,
            ofertaTitulo: postulacion.oferta.titulo,
            entrevistaFecha,
            entrevistaHora,
            comentario: motivo,
          }).then(() => {
            console.log(`✅ Correo de entrevista enviado a ${egresado.user.email}`);
          }).catch((emailError) => {
            console.error(`❌ Error al enviar correo a ${egresado.user.email}:`, emailError);
          });
        } else {
          console.warn(`⚠️ Email inválido o de prueba para egresado ${postulacion.egresadoId}: ${email}`);
        }
      } else {
        console.log(`⏭️ No es entrevista o faltan datos: esEntrevista=${esEntrevista}, fecha=${entrevistaFecha}, hora=${entrevistaHora}`);
      }
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }

    return postulacion;
  }
}
