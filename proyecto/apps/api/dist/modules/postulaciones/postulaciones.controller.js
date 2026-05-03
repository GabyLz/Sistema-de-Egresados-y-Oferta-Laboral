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
exports.PostulacionesController = void 0;
const common_1 = require("@nestjs/common");
const postulaciones_service_1 = require("./postulaciones.service");
let PostulacionesController = class PostulacionesController {
    constructor(service) {
        this.service = service;
    }
    async postular(body) {
        return this.service.create(body.egresadoId, body.ofertaId);
    }
    async listByEgresado(id) {
        return this.service.findByEgresado(id);
    }
    async listByEmpresa(id) {
        return this.service.findByEmpresa(id);
    }
    async updateStatus(id, body) {
        return this.service.updateStatus(id, body.estado, body.motivo);
    }
};
exports.PostulacionesController = PostulacionesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "postular", null);
__decorate([
    (0, common_1.Get)('egresado/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listByEgresado", null);
__decorate([
    (0, common_1.Get)('empresa/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listByEmpresa", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "updateStatus", null);
exports.PostulacionesController = PostulacionesController = __decorate([
    (0, common_1.Controller)('postulaciones'),
    __metadata("design:paramtypes", [postulaciones_service_1.PostulacionesService])
], PostulacionesController);
