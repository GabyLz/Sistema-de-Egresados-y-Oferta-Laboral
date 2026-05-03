import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class PostulacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

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

  async updateStatus(id: string, estado: string, motivo?: string) {
    const prisma: any = this.prisma;
    const estadoNormalizado = estado?.trim().toLowerCase();
    const estaContratado = estadoNormalizado === 'contratado';
    
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
          comentario: motivo || `Cambio de estado a ${estado}`
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
          motivo: motivo || `Cambio de estado a ${estado}`,
        }
      });

      return updated;
    });

    // 3. Notificar al egresado
    try {
      await this.notificacionesService.create({
        userId: postulacion.egresadoId,
        titulo: 'Actualización de Postulación',
        mensaje: `Tu postulación para "${postulacion.oferta.titulo}" ha cambiado al estado: ${estado}`,
        tipo: 'interna',
      });
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }

    return postulacion;
  }
}
