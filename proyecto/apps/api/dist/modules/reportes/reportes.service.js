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
var ReportesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const REDIS_URL = globalThis.process?.env?.REDIS_URL || 'redis://localhost:6379';
let ReportesService = ReportesService_1 = class ReportesService {
    // private readonly queue = new Queue('reportes', { connection: { url: REDIS_URL } });
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReportesService_1.name);
    }
    async solicitarReporte(usuarioId, tipo, parametros) {
        const prisma = this.prisma;
        // Validar usuario
        const user = await prisma.user.findUnique({ where: { id: usuarioId } });
        if (!user)
            throw new Error('Usuario no encontrado');
        const reporte = await prisma.reporteGenerado.create({
            data: {
                usuarioId,
                tipoReporte: tipo,
                parametros: parametros,
                estado: 'completado',
                urlArchivo: `/storage/reports/report_${Date.now()}.pdf`,
                fechaCompletado: new Date(),
            },
        });
        this.logger.log(`Reporte ${reporte.id} generado para usuario ${usuarioId}`);
        return reporte;
    }
    async findAll() {
        const prisma = this.prisma;
        return prisma.reporteGenerado.findMany({
            include: { usuario: { select: { email: true, rol: true } } },
            orderBy: { fechaSolicitud: 'desc' }
        });
    }
    async findByUser(usuarioId) {
        const prisma = this.prisma;
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
    async generarYAlmacenarReporte(jobData) {
        this.logger.log(`Procesando reporte ${jobData.reporteId}`);
        const prisma = this.prisma;
        return prisma.reporteGenerado.update({
            where: { id: jobData.reporteId },
            data: {
                estado: 'completado',
                urlArchivo: `/storage/reports/${jobData.reporteId}.pdf`,
                fechaCompletado: new Date(),
            },
        });
    }
    async obtenerReporte(id) {
        const prisma = this.prisma;
        return prisma.reporteGenerado.findUnique({ where: { id } });
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = ReportesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
