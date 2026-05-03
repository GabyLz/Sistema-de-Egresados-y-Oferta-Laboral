"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificacionesService = class NotificacionesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(userName) {
        // Buscamos al usuario por su email (userName en el context)
        const user = await this.prisma.user.findUnique({
            where: { email: userName }
        });
        if (!user)
            return [];
        return this.prisma.notificacion.findMany({
            where: { usuarioId: user.id },
            orderBy: { createdAt: 'desc' }
        });
    }
    async create(data) {
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
    async markAsRead(id) {
        return this.prisma.notificacion.update({
            where: { id },
            data: { leida: true }
        });
    }
    async remove(id) {
        return this.prisma.notificacion.delete({
            where: { id }
        });
    }
    async checkClosingDates() {
        const prisma = this.prisma;
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
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacionesService);
