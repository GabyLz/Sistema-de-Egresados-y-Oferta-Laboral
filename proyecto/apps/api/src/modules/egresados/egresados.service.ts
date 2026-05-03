import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class EgresadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async findAll(filter?: { carrera?: string; anioEgreso?: number }) {
    const prisma: any = this.prisma;
    const where: any = {};
    if (filter?.carrera) where.carrera = filter.carrera;
    if (filter?.anioEgreso) where.anioEgreso = filter.anioEgreso;

    return prisma.egresado.findMany({
      where,
      include: {
        user: true,
        egresadoHabilidades: { include: { habilidad: true } },
        experienciasLaborales: true,
        formacionesAcademicas: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prisma: any = this.prisma;
    const egresado = await prisma.egresado.findUnique({
      where: { id },
      include: {
        user: true,
        egresadoHabilidades: { include: { habilidad: true } },
        experienciasLaborales: true,
        formacionesAcademicas: true,
      },
    });

    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado;
  }

  async create(data: any) {
    const prisma: any = this.prisma;
    return prisma.egresado.create({ data });
  }

  async update(id: string, data: any) {
    const prisma: any = this.prisma;
    
    // Solo permitir campos que existen en el modelo Egresado
    const allowedFields = ['nombres', 'apellidos', 'carrera', 'telefono', 'direccion', 'fechaNacimiento', 'anioEgreso', 'cvUrl'];
    const cleanData: any = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    });
    
    // Normalizar tipos de datos para Prisma
    if (cleanData.anioEgreso !== undefined) {
      const parsedAnio = parseInt(cleanData.anioEgreso);
      cleanData.anioEgreso = isNaN(parsedAnio) ? null : parsedAnio;
    }
    
    if (cleanData.fechaNacimiento) {
      const date = new Date(cleanData.fechaNacimiento);
      if (isNaN(date.getTime())) {
        cleanData.fechaNacimiento = null;
      } else {
        // Asegurar que solo se guarde la fecha (sin hora) para evitar problemas de zona horaria
        cleanData.fechaNacimiento = date;
      }
    }

    if (cleanData.cvUrl !== undefined && cleanData.cvUrl !== null && cleanData.cvUrl !== '') {
      // Validación básica de URL
      try {
        new URL(cleanData.cvUrl);
      } catch (e) {
        throw new Error('El enlace del currículum no es una URL válida');
      }
    }

    return prisma.egresado.update({ where: { id }, data: cleanData });
  }

  async addEducacion(data: any) {
    const prisma: any = this.prisma;
    return prisma.formacionAcademica.create({
      data: {
        egresadoId: data.egresadoId,
        institucion: data.institucion,
        titulo: data.titulo,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      }
    });
  }

  async updateEducacion(id: string, data: any) {
    const prisma: any = this.prisma;
    return prisma.formacionAcademica.update({
      where: { id },
      data: {
        institucion: data.institucion,
        titulo: data.titulo,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      }
    });
  }

  async removeEducacion(id: string) {
    const prisma: any = this.prisma;
    return prisma.formacionAcademica.delete({ where: { id } });
  }

  async addExperiencia(data: any) {
    const prisma: any = this.prisma;
    return prisma.experienciaLaboral.create({
      data: {
        egresadoId: data.egresadoId,
        empresa: data.empresa,
        cargo: data.cargo,
        descripcion: data.descripcion,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      }
    });
  }

  async updateExperiencia(id: string, data: any) {
    const prisma: any = this.prisma;
    return prisma.experienciaLaboral.update({
      where: { id },
      data: {
        empresa: data.empresa,
        cargo: data.cargo,
        descripcion: data.descripcion,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      }
    });
  }

  async removeExperiencia(id: string) {
    const prisma: any = this.prisma;
    return prisma.experienciaLaboral.delete({ where: { id } });
  }

  async remove(id: string) {
    const prisma: any = this.prisma;
    return prisma.egresado.delete({ where: { id } });
  }

  async asociarTalent(id: string, data: { empresaNombre: string; ofertaTitulo: string; ofertaId?: string; empresaId?: string }) {
    const egresado = await this.prisma.egresado.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!egresado) {
      throw new NotFoundException('Egresado no encontrado');
    }

    try {
      await this.notificacionesService.create({
        userId: egresado.id,
        titulo: 'Empresa interesada en ti',
        mensaje: `La empresa ${data.empresaNombre} está interesada en ti. Postula a "${data.ofertaTitulo}".`,
        tipo: 'interna',
      });
    } catch (error) {
      console.error('Error al crear notificación de asociación:', error);
    }

    return {
      ok: true,
      message: 'Asociación enviada correctamente',
    };
  }
}
