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
exports.HabilidadesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let HabilidadesService = class HabilidadesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.habilidad.findMany();
    }
    async create(data) {
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
    async update(id, data) {
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
    async remove(id) {
        return this.prisma.habilidad.delete({ where: { id } });
    }
    async linkToEgresado(egresadoId, habilidadId, nivel) {
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
    async removeLink(egresadoId, habilidadId) {
        return this.prisma.egresadoHabilidad.delete({
            where: {
                egresadoId_habilidadId: {
                    egresadoId,
                    habilidadId
                }
            }
        });
    }
};
exports.HabilidadesService = HabilidadesService;
exports.HabilidadesService = HabilidadesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HabilidadesService);
