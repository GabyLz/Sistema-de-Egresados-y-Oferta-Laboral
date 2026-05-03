import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.empresa.findMany({
      include: { user: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.empresa.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.empresa.update({
      where: { id },
      data: {
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        sector: data.sector,
        sitioWeb: data.sitioWeb,
        descripcion: data.descripcion,
        telefono: data.telefono,
        ubicacion: data.ubicacion,
        redesSociales: data.redesSociales
      }
    });
  }

  async updateStatus(id: string, estado: string, motivo?: string) {
    // Normalizar estado para el check constraint
    const estadoNormalizado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    
    return this.prisma.empresa.update({
      where: { id },
      data: { 
        estado: estadoNormalizado as any
      }
    });
  }

  async remove(id: string) {
    return this.prisma.empresa.delete({
      where: { id }
    });
  }

  async updateLogo(id: string, logoUrl: string) {
    return this.prisma.empresa.update({
      where: { id },
      data: { logoUrl }
    });
  }

}
