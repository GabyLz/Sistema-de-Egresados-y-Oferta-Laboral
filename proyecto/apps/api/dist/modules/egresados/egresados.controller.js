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
exports.EgresadosController = void 0;
const common_1 = require("@nestjs/common");
const egresados_service_1 = require("./egresados.service");
let EgresadosController = class EgresadosController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async create(body) {
        return this.service.create(body);
    }
    async update(id, body) {
        return this.service.update(id, body);
    }
    async addEducacion(body) {
        return this.service.addEducacion(body);
    }
    async updateEducacion(id, body) {
        return this.service.updateEducacion(id, body);
    }
    async deleteEducacion(id) {
        return this.service.removeEducacion(id);
    }
    async addExperiencia(body) {
        return this.service.addExperiencia(body);
    }
    async updateExperiencia(id, body) {
        return this.service.updateExperiencia(id, body);
    }
    async deleteExperiencia(id) {
        return this.service.removeExperiencia(id);
    }
    async delete(id) {
        return this.service.remove(id);
    }
    async asociar(id, body) {
        return this.service.asociarTalent(id, body);
    }
};
exports.EgresadosController = EgresadosController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('perfil/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('educacion'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "addEducacion", null);
__decorate([
    (0, common_1.Put)('educacion/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "updateEducacion", null);
__decorate([
    (0, common_1.Delete)('educacion/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "deleteEducacion", null);
__decorate([
    (0, common_1.Post)('experiencia'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "addExperiencia", null);
__decorate([
    (0, common_1.Put)('experiencia/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "updateExperiencia", null);
__decorate([
    (0, common_1.Delete)('experiencia/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "deleteExperiencia", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/asociar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EgresadosController.prototype, "asociar", null);
exports.EgresadosController = EgresadosController = __decorate([
    (0, common_1.Controller)('egresados'),
    __metadata("design:paramtypes", [egresados_service_1.EgresadosService])
], EgresadosController);
