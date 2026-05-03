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
exports.OfertasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let OfertasService = class OfertasService {
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    async findAll(filter) {
        const where = {};
        if (filter?.modalidad)
            where.modalidad = filter.modalidad;
        if (typeof filter?.activa === 'boolean')
            where.activa = filter.activa;
        if (filter?.empresaId)
            where.empresaId = filter.empresaId;
        if (filter?.estado)
            where.estado = filter.estado;
        return this.prisma.ofertaLaboral.findMany({
            where,
            include: { empresa: true, ofertaHabilidades: { include: { habilidad: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const oferta = await this.prisma.ofertaLaboral.findUnique({
            where: { id },
            include: { empresa: true, ofertaHabilidades: { include: { habilidad: true } }, postulaciones: true },
        });
        if (!oferta)
            throw new common_1.NotFoundException('Oferta no encontrada');
        return oferta;
    }
    async create(data) {
        const { habilidadesIds, ...rest } = data;
        // Asegurar que los salarios sean Decimal o null
        if (rest.salarioMin !== undefined)
            rest.salarioMin = rest.salarioMin !== null ? Number(rest.salarioMin) : null;
        if (rest.salarioMax !== undefined)
            rest.salarioMax = rest.salarioMax !== null ? Number(rest.salarioMax) : null;
        const oferta = await this.prisma.ofertaLaboral.create({
            data: {
                ...rest,
                ofertaHabilidades: {
                    create: (habilidadesIds || []).map((id) => ({ habilidadId: id }))
                }
            },
            include: { empresa: true }
        });
        // Si la oferta se crea ya aprobada (por admin), notificar
        if (oferta.estado === 'Aprobada') {
            try {
                await this.notifyRelevantEgresados(oferta.id, habilidadesIds);
            }
            catch (e) {
                console.error('Error notifying egresados for approved oferta (create):', e);
            }
        }
        return oferta;
    }
    async update(id, data) {
        const { habilidadesIds, ...rest } = data;
        // Asegurar que los salarios sean Decimal o null
        if (rest.salarioMin !== undefined)
            rest.salarioMin = rest.salarioMin !== null ? Number(rest.salarioMin) : null;
        if (rest.salarioMax !== undefined)
            rest.salarioMax = rest.salarioMax !== null ? Number(rest.salarioMax) : null;
        if (habilidadesIds) {
            await this.prisma.ofertaHabilidad.deleteMany({ where: { ofertaId: id } });
            rest.ofertaHabilidades = {
                create: habilidadesIds.map((hid) => ({ habilidadId: hid }))
            };
        }
        const oferta = await this.prisma.ofertaLaboral.update({ where: { id }, data: rest });
        // Si se actualiza a aprobada, notificar
        if (rest.estado === 'Aprobada') {
            try {
                await this.notifyRelevantEgresados(id, habilidadesIds);
            }
            catch (e) {
                console.error('Error notifying egresados for approved oferta (update):', e);
            }
        }
        return oferta;
    }
    async updateStatus(id, estado, motivo) {
        const oferta = await this.prisma.ofertaLaboral.update({
            where: { id },
            data: { estado, activa: estado === 'Aprobada' },
            include: { ofertaHabilidades: true }
        });
        if (estado === 'Aprobada') {
            try {
                const hids = oferta.ofertaHabilidades.map(oh => oh.habilidadId);
                await this.notifyRelevantEgresados(id, hids);
            }
            catch (e) {
                console.error('Error notifying egresados for approved oferta (updateStatus):', e);
            }
        }
        return oferta;
    }
    async notifyRelevantEgresados(ofertaId, habilidadIds) {
        if (!habilidadIds || habilidadIds.length === 0)
            return;
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
    async findPostulaciones(ofertaId) {
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
        return postulaciones.map((postulacion) => ({
            ...postulacion,
            egresado: {
                ...postulacion.egresado,
                empleadoActualmente: postulacion.estado?.toLowerCase() === 'contratado' || postulacion.egresado?.empleadoActualmente,
            },
        }));
    }
    async remove(id) {
        return this.prisma.ofertaLaboral.delete({ where: { id } });
    }
};
exports.OfertasService = OfertasService;
exports.OfertasService = OfertasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], OfertasService);
