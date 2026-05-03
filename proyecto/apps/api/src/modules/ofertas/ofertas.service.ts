import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class OfertasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async findAll(filter?: { modalidad?: string; activa?: boolean; empresaId?: string; estado?: string }) {
    const where: any = {};
    if (filter?.modalidad) where.modalidad = filter.modalidad;
    if (typeof filter?.activa === 'boolean') where.activa = filter.activa;
    if (filter?.empresaId) where.empresaId = filter.empresaId;
    if (filter?.estado) where.estado = filter.estado;

    return this.prisma.ofertaLaboral.findMany({
      where,
      include: { empresa: true, ofertaHabilidades: { include: { habilidad: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id },
      include: { empresa: true, ofertaHabilidades: { include: { habilidad: true } }, postulaciones: true },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    return oferta;
  }

  async create(data: any) {
    const { habilidadesIds, ...rest } = data;
    // Asegurar que los salarios sean Decimal o null
    if (rest.salarioMin !== undefined) rest.salarioMin = rest.salarioMin !== null ? Number(rest.salarioMin) : null;
    if (rest.salarioMax !== undefined) rest.salarioMax = rest.salarioMax !== null ? Number(rest.salarioMax) : null;

    const oferta = await this.prisma.ofertaLaboral.create({
      data: {
        ...rest,
        ofertaHabilidades: {
          create: (habilidadesIds || []).map((id: string) => ({ habilidadId: id }))
        }
      },
      include: { empresa: true }
    });

    // Si la oferta se crea ya aprobada (por admin), notificar
    if (oferta.estado === 'Aprobada') {
      try {
        await this.notifyRelevantEgresados(oferta.id, habilidadesIds);
      } catch (e) {
        console.error('Error notifying egresados for approved oferta (create):', e);
      }
    }

    return oferta;
  }

  async update(id: string, data: any) {
    const { habilidadesIds, ...rest } = data;
    // Asegurar que los salarios sean Decimal o null
    if (rest.salarioMin !== undefined) rest.salarioMin = rest.salarioMin !== null ? Number(rest.salarioMin) : null;
    if (rest.salarioMax !== undefined) rest.salarioMax = rest.salarioMax !== null ? Number(rest.salarioMax) : null;

    if (habilidadesIds) {
      await this.prisma.ofertaHabilidad.deleteMany({ where: { ofertaId: id } });
      rest.ofertaHabilidades = {
        create: habilidadesIds.map((hid: string) => ({ habilidadId: hid }))
      };
    }
    const oferta = await this.prisma.ofertaLaboral.update({ where: { id }, data: rest });
    
    // Si se actualiza a aprobada, notificar
    if (rest.estado === 'Aprobada') {
      try {
        await this.notifyRelevantEgresados(id, habilidadesIds);
      } catch (e) {
        console.error('Error notifying egresados for approved oferta (update):', e);
      }
    }
    
    return oferta;
  }

  async updateStatus(id: string, estado: string, motivo?: string) {
    const oferta = await this.prisma.ofertaLaboral.update({
      where: { id },
      data: { estado, activa: estado === 'Aprobada' },
      include: { ofertaHabilidades: true }
    });

    if (estado === 'Aprobada') {
      try {
        const hids = oferta.ofertaHabilidades.map(oh => oh.habilidadId);
        await this.notifyRelevantEgresados(id, hids);
      } catch (e) {
        console.error('Error notifying egresados for approved oferta (updateStatus):', e);
      }
    }

    return oferta;
  }

  private async notifyRelevantEgresados(ofertaId: string, habilidadIds: string[]) {
    if (!habilidadIds || habilidadIds.length === 0) return;

    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: { id: ofertaId },
      include: { empresa: true }
    });

    // Buscar egresados que tengan al menos una de las habilidades de la oferta
    const egresados = await this.prisma.egresado.findMany({
      where: {
        egresadoHabilidades: {
          some: {
            habilidadId: { in: habilidadIds }
          }
        }
      },
      select: { id: true }
    });

    for (const egresado of egresados) {
      await this.notificacionesService.create({
        userId: egresado.id,
        titulo: 'Empresa interesada en ti',
        mensaje: `La empresa ${oferta.empresa.razonSocial} está interesada en ti. Postula a "${oferta.titulo}".`,
        tipo: 'interna'
      });
    }
  }

  async findPostulaciones(ofertaId: string) {
    const postulaciones = await this.prisma.postulacion.findMany({
      where: { ofertaId },
      include: {
        egresado: {
          include: {
            user: true,
            egresadoHabilidades: { include: { habilidad: true } },
            experienciasLaborales: true,
            formacionesAcademicas: true
          }
        },
        evaluaciones: true,
        historial: {
          orderBy: { fechaCambio: 'desc' },
        },
      }
    });

    return postulaciones.map((postulacion: any) => ({
      ...postulacion,
      egresado: {
        ...postulacion.egresado,
        empleadoActualmente: postulacion.estado?.toLowerCase() === 'contratado' || postulacion.egresado?.empleadoActualmente,
      },
    }));
  }

  async remove(id: string) {
    return this.prisma.ofertaLaboral.delete({ where: { id } });
  }

}
