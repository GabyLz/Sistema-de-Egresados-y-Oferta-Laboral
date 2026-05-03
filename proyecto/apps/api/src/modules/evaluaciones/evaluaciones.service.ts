import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return (this.prisma as any).evaluacionPostulante.create({
      data: {
        postulacionId: data.postulacionId,
        empresaId: data.empresaId,
        puntaje: data.puntaje,
        comentarios: data.comentarios,
        competencias: data.competencias,
      },
    });
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
