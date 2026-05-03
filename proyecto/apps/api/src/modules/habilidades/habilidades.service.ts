import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HabilidadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.habilidad.findMany();
  }

  async create(data: { nombre: string; tipo: string; categoria?: string }) {
    // Normalizar el tipo según el check constraint ('tecnica' | 'blanda')
    const tipoNormalizado = data.tipo.toLowerCase().includes('tecnica') || data.tipo.toLowerCase().includes('técnica') 
      ? 'tecnica' 
      : 'blanda';
    
    return this.prisma.habilidad.create({ 
      data: {
        nombre: data.nombre,
        tipo: tipoNormalizado
      } 
    });
  }

  async update(id: string, data: { nombre: string; tipo: string; categoria?: string }) {
    const tipoNormalizado = data.tipo.toLowerCase().includes('tecnica') || data.tipo.toLowerCase().includes('técnica') 
      ? 'tecnica' 
      : 'blanda';

    return this.prisma.habilidad.update({
      where: { id },
      data: {
        nombre: data.nombre,
        tipo: tipoNormalizado
      }
    });
  }

  async remove(id: string) {
    return this.prisma.habilidad.delete({ where: { id } });
  }

  async linkToEgresado(egresadoId: string, habilidadId: string, nivel?: number) {
    return this.prisma.egresadoHabilidad.upsert({
      where: {
        egresadoId_habilidadId: {
          egresadoId,
          habilidadId
        }
      },
      update: { nivel: nivel || 1 },
      create: { egresadoId, habilidadId, nivel: nivel || 1 }
    });
  }

  async removeLink(egresadoId: string, habilidadId: string) {
    return this.prisma.egresadoHabilidad.delete({
      where: {
        egresadoId_habilidadId: {
          egresadoId,
          habilidadId
        }
      }
    });
  }
}
