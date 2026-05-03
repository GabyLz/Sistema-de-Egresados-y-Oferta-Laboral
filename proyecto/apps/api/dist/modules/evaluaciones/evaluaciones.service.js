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
exports.EvaluacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let EvaluacionesService = class EvaluacionesService {
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    async create(data) {
        const evaluacion = await this.prisma.evaluacionPostulante.create({
            data: {
                postulacionId: data.postulacionId,
                empresaId: data.empresaId,
                puntaje: data.puntaje,
                comentarios: data.comentarios,
                competencias: data.competencias,
            },
            include: {
                postulacion: {
                    include: {
                        egresado: true,
                        oferta: true,
                    },
                },
                empresa: true,
            },
        });
        // Notificar al egresado que recibió una evaluación
        try {
            if (evaluacion.postulacion?.egresado) {
                await this.notificacionesService.create({
                    userId: evaluacion.postulacion.egresado.id,
                    titulo: 'Evaluación Recibida',
                    mensaje: `La empresa ${evaluacion.empresa.razonSocial} ha evaluado tu postulación a "${evaluacion.postulacion.oferta.titulo}". Puntaje: ${evaluacion.puntaje}/100`,
                    tipo: 'interna',
                });
            }
        }
        catch (notifError) {
            console.error('Error al enviar notificación de evaluación:', notifError);
        }
        return evaluacion;
    }
    async findByPostulacion(postulacionId) {
        return this.prisma.evaluacionPostulante.findMany({
            where: { postulacionId },
            orderBy: { fecha: 'desc' },
        });
    }
    // Evaluaciones recibidas por un egresado a través de sus postulaciones
    async findByEgresado(egresadoId) {
        return this.prisma.evaluacionPostulante.findMany({
            where: {
                postulacion: {
                    egresadoId,
                },
            },
            include: {
                postulacion: {
                    include: {
                        oferta: true,
                    },
                },
                empresa: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }
    // Evaluaciones creadas por una empresa
    async findByEmpresa(empresaId) {
        return this.prisma.evaluacionPostulante.findMany({
            where: { empresaId },
            include: {
                postulacion: {
                    include: {
                        egresado: true,
                        oferta: true,
                    },
                },
                empresa: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }
};
exports.EvaluacionesService = EvaluacionesService;
exports.EvaluacionesService = EvaluacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], EvaluacionesService);
