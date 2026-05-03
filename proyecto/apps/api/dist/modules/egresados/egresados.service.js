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
exports.EgresadosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let EgresadosService = class EgresadosService {
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    async findAll(filter) {
        const prisma = this.prisma;
        const where = {};
        if (filter?.carrera)
            where.carrera = filter.carrera;
        if (filter?.anioEgreso)
            where.anioEgreso = filter.anioEgreso;
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
    async findOne(id) {
        const prisma = this.prisma;
        const egresado = await prisma.egresado.findUnique({
            where: { id },
            include: {
                user: true,
                egresadoHabilidades: { include: { habilidad: true } },
                experienciasLaborales: true,
                formacionesAcademicas: true,
            },
        });
        if (!egresado)
            throw new common_1.NotFoundException('Egresado no encontrado');
        return egresado;
    }
    async create(data) {
        const prisma = this.prisma;
        return prisma.egresado.create({ data });
    }
    async update(id, data) {
        const prisma = this.prisma;
        // Solo permitir campos que existen en el modelo Egresado
        const allowedFields = ['nombres', 'apellidos', 'carrera', 'telefono', 'direccion', 'fechaNacimiento', 'anioEgreso', 'cvUrl'];
        const cleanData = {};
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
            }
            else {
                // Asegurar que solo se guarde la fecha (sin hora) para evitar problemas de zona horaria
                cleanData.fechaNacimiento = date;
            }
        }
        if (cleanData.cvUrl !== undefined && cleanData.cvUrl !== null && cleanData.cvUrl !== '') {
            // Validación básica de URL
            try {
                new URL(cleanData.cvUrl);
            }
            catch (e) {
                throw new Error('El enlace del currículum no es una URL válida');
            }
        }
        return prisma.egresado.update({ where: { id }, data: cleanData });
    }
    async addEducacion(data) {
        const prisma = this.prisma;
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
    async updateEducacion(id, data) {
        const prisma = this.prisma;
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
    async removeEducacion(id) {
        const prisma = this.prisma;
        return prisma.formacionAcademica.delete({ where: { id } });
    }
    async addExperiencia(data) {
        const prisma = this.prisma;
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
    async updateExperiencia(id, data) {
        const prisma = this.prisma;
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
    async removeExperiencia(id) {
        const prisma = this.prisma;
        return prisma.experienciaLaboral.delete({ where: { id } });
    }
    async remove(id) {
        const prisma = this.prisma;
        return prisma.egresado.delete({ where: { id } });
    }
    async asociarTalent(id, data) {
        const egresado = await this.prisma.egresado.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!egresado) {
            throw new common_1.NotFoundException('Egresado no encontrado');
        }
        try {
            await this.notificacionesService.create({
                userId: egresado.id,
                titulo: 'Empresa interesada en ti',
                mensaje: `La empresa ${data.empresaNombre} está interesada en ti. Postula a "${data.ofertaTitulo}".`,
                tipo: 'interna',
            });
        }
        catch (error) {
            console.error('Error al crear notificación de asociación:', error);
        }
        return {
            ok: true,
            message: 'Asociación enviada correctamente',
        };
    }
};
exports.EgresadosService = EgresadosService;
exports.EgresadosService = EgresadosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], EgresadosService);
