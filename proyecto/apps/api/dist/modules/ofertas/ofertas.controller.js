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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfertasController = void 0;
const common_1 = require("@nestjs/common");
const ofertas_service_1 = require("./ofertas.service");
let OfertasController = class OfertasController {
    constructor(service) {
        this.service = service;
    }
    async list(query) {
        return this.service.findAll(query);
    }
    async get(id) {
        return this.service.findOne(id);
    }
    async getPostulaciones(id) {
        return this.service.findPostulaciones(id);
    }
    async getRecomendadas(egresadoId) {
        // Por ahora devolvemos las más recientes como recomendadas
        return this.service.findAll({ activa: true });
    }
    async create(body) {
        return this.service.create(body);
    }
    async update(id, body) {
        return this.service.update(id, body);
    }
    async updateStatus(id, body) {
        return this.service.updateStatus(id, body.estado, body.motivo);
    }
    async moderate(id, body) {
        return this.service.updateStatus(id, body.estado, body.comentario);
    }
    async delete(id) {
        return this.service.remove(id);
    }
};
exports.OfertasController = OfertasController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/postulaciones'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "getPostulaciones", null);
__decorate([
    (0, common_1.Get)('recomendadas/:egresadoId'),
    __param(0, (0, common_1.Param)('egresadoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "getRecomendadas", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/moderacion'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "moderate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OfertasController.prototype, "delete", null);
exports.OfertasController = OfertasController = __decorate([
    (0, common_1.Controller)('ofertas'),
    __metadata("design:paramtypes", [ofertas_service_1.OfertasService])
], OfertasController);
