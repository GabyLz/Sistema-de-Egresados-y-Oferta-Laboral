import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class EvaluacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(data: any) {
    const evaluacion = await (this.prisma as any).evaluacionPostulante.create({
      data: {
        postulacionId: data.postulacionId,
        empresaId: data.empresaId,
        puntaje: data.puntaje,
        comentarios: data.comentarios,
        competencias: data.competencias,
      },
      include: {
        postulacion: {
          include: {
            egresado: true,
            oferta: true,
          },
        },
        empresa: true,
      },
    });

    // Notificar al egresado que recibió una evaluación
    try {
      if (evaluacion.postulacion?.egresado) {
        await this.notificacionesService.create({
          userId: evaluacion.postulacion.egresado.id,
          titulo: 'Evaluación Recibida',
          mensaje: `La empresa ${evaluacion.empresa.razonSocial} ha evaluado tu postulación a "${evaluacion.postulacion.oferta.titulo}". Puntaje: ${evaluacion.puntaje}/100`,
          tipo: 'interna',
        });
      }
    } catch (notifError) {
      console.error('Error al enviar notificación de evaluación:', notifError);
    }

    return evaluacion;
  }

  async findByPostulacion(postulacionId: string) {
    return (this.prisma as any).evaluacionPostulante.findMany({
      where: { postulacionId },
      orderBy: { fecha: 'desc' },
    });
  }

  // Evaluaciones recibidas por un egresado a través de sus postulaciones
  async findByEgresado(egresadoId: string) {
    return (this.prisma as any).evaluacionPostulante.findMany({
      where: {
        postulacion: {
          egresadoId,
        },
      },
      include: {
        postulacion: {
          include: {
            oferta: true,
          },
        },
        empresa: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  // Evaluaciones creadas por una empresa
  async findByEmpresa(empresaId: string) {
    return (this.prisma as any).evaluacionPostulante.findMany({
      where: { empresaId },
      include: {
        postulacion: {
          include: {
            egresado: true,
            oferta: true,
          },
        },
        empresa: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }
}
