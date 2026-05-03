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
exports.EvaluacionesController = void 0;
const common_1 = require("@nestjs/common");
const evaluaciones_service_1 = require("./evaluaciones.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
let EvaluacionesController = class EvaluacionesController {
    constructor(service) {
        this.service = service;
    }
    async create(body) {
        return this.service.create(body);
    }
    async listByPostulacion(id) {
        return this.service.findByPostulacion(id);
    }
    async getEvaluacionesEgresado(egresadoId) {
        return this.service.findByEgresado(egresadoId);
    }
    async getEvaluacionesEmpresa(empresaId) {
        return this.service.findByEmpresa(empresaId);
    }
};
exports.EvaluacionesController = EvaluacionesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('postulacion/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "listByPostulacion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('egresado/:egresadoId'),
    __param(0, (0, common_1.Param)('egresadoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "getEvaluacionesEgresado", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('empresa/:empresaId'),
    __param(0, (0, common_1.Param)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "getEvaluacionesEmpresa", null);
exports.EvaluacionesController = EvaluacionesController = __decorate([
    (0, common_1.Controller)('evaluaciones'),
    __metadata("design:paramtypes", [evaluaciones_service_1.EvaluacionesService])
], EvaluacionesController);
