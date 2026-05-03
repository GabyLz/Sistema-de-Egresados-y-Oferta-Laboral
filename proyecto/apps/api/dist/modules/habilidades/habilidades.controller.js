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
exports.HabilidadesController = void 0;
const common_1 = require("@nestjs/common");
const habilidades_service_1 = require("./habilidades.service");
let HabilidadesController = class HabilidadesController {
    constructor(service) {
        this.service = service;
    }
    async list() {
        return this.service.findAll();
    }
    async create(body) {
        return this.service.create(body);
    }
    async update(id, body) {
        return this.service.update(id, body);
    }
    async delete(id) {
        return this.service.remove(id);
    }
    async link(body) {
        return this.service.linkToEgresado(body.egresadoId, body.habilidadId, body.nivel);
    }
    async removeLink(egresadoId, habilidadId) {
        return this.service.removeLink(egresadoId, habilidadId);
    }
};
exports.HabilidadesController = HabilidadesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('link'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "link", null);
__decorate([
    (0, common_1.Delete)('egresado/:egresadoId/:habilidadId'),
    __param(0, (0, common_1.Param)('egresadoId')),
    __param(1, (0, common_1.Param)('habilidadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HabilidadesController.prototype, "removeLink", null);
exports.HabilidadesController = HabilidadesController = __decorate([
    (0, common_1.Controller)('habilidades'),
    __metadata("design:paramtypes", [habilidades_service_1.HabilidadesService])
], HabilidadesController);
