import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Queue } from 'bullmq';

const REDIS_URL = (globalThis as any).process?.env?.REDIS_URL || 'redis://localhost:6379';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);
  // private readonly queue = new Queue('reportes', { connection: { url: REDIS_URL } });

  constructor(private readonly prisma: PrismaService) {}

  async solicitarReporte(usuarioId: string, tipo: string, parametros: unknown) {
    const prisma: any = this.prisma;
    
    // Validar usuario
    const user = await prisma.user.findUnique({ where: { id: usuarioId } });
    if (!user) throw new Error('Usuario no encontrado');

    const reporte = await prisma.reporteGenerado.create({
      data: {
        usuarioId,
        tipoReporte: tipo,
        parametros: parametros as any,
        estado: 'completado',
        urlArchivo: `/storage/reports/report_${Date.now()}.pdf`,
        fechaCompletado: new Date(),
      },
    });

    this.logger.log(`Reporte ${reporte.id} generado para usuario ${usuarioId}`);
    return reporte;
  }

  async findAll() {
    const prisma: any = this.prisma;
    return prisma.reporteGenerado.findMany({
      include: { usuario: { select: { email: true, rol: true } } },
      orderBy: { fechaSolicitud: 'desc' }
    });
  }

  async findByUser(usuarioId: string) {
    const prisma: any = this.prisma;
    
    // Si el usuario es admin, puede ver todos los reportes
    const user = await prisma.user.findUnique({ where: { id: usuarioId } });
    if (user?.rol === 'admin') {
      return this.findAll();
    }

    return prisma.reporteGenerado.findMany({
      where: { usuarioId },
      orderBy: { fechaSolicitud: 'desc' }
    });
  }


  async generarYAlmacenarReporte(jobData: { reporteId: string; tipo: string; parametros: unknown }) {
    this.logger.log(`Procesando reporte ${jobData.reporteId}`);
    const prisma: any = this.prisma;
    return prisma.reporteGenerado.update({
      where: { id: jobData.reporteId },
      data: {
        estado: 'completado',
        urlArchivo: `/storage/reports/${jobData.reporteId}.pdf`,
        fechaCompletado: new Date(),
      },
    });
  }

  async obtenerReporte(id: string) {
    const prisma: any = this.prisma;
    return prisma.reporteGenerado.findUnique({ where: { id } });
  }
}