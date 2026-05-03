import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userName: string) {
    // Buscamos al usuario por su email (userName en el context)
    const user = await this.prisma.user.findUnique({
      where: { email: userName }
    });

    if (!user) return [];

    return this.prisma.notificacion.findMany({
      where: { usuarioId: user.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: { userId: string, mensaje: string, titulo?: string, tipo?: string }) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: data.userId,
        titulo: data.titulo || 'Nueva notificación',
        contenido: data.mensaje,
        tipo: data.tipo || 'interna',
        leida: false
      }
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true }
    });
  }
  async remove(id: string) {
    return this.prisma.notificacion.delete({
      where: { id }
    });
  }

  async checkClosingDates() {
    const prisma: any = this.prisma;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const offersClosingSoon = await prisma.ofertaLaboral.findMany({
      where: {
        fechaCierre: {
          gte: new Date(),
          lte: inThreeDays
        },
        estado: 'Aprobada',
        activa: true
      },
      include: { empresa: true }
    });

    for (const oferta of offersClosingSoon) {
      await this.create({
        userId: oferta.empresaId,
        titulo: 'Recordatorio de Cierre',
        mensaje: `Tu oferta "${oferta.titulo}" cerrará el ${oferta.fechaCierre.toLocaleDateString()}. Revisa tus postulantes pronto.`,
        tipo: 'interna'
      });
    }
  }
}
