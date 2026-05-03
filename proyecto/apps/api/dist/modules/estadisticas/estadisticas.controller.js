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
exports.EstadisticasController = void 0;
const common_1 = require("@nestjs/common");
const estadisticas_service_1 = require("./estadisticas.service");
let EstadisticasController = class EstadisticasController {
    constructor(estadisticas) {
        this.estadisticas = estadisticas;
    }
    kpis(query) {
        return this.estadisticas.kpisAdmin(query);
    }
    series(query) {
        return this.estadisticas.evolucionMensual(query);
    }
    distribucion(query) {
        return this.estadisticas.distribucionPorCarrera(query);
    }
    habilidades(query) {
        return this.estadisticas.habilidadesDemandadas(query);
    }
    cohortes(query) {
        return this.estadisticas.tasaContratacionPorCohorte(query);
    }
    egresadoKpis(id) {
        return this.estadisticas.kpisEgresado(id);
    }
    empresaKpis(id) {
        return this.estadisticas.kpisEmpresa(id);
    }
};
exports.EstadisticasController = EstadisticasController;
__decorate([
    (0, common_1.Get)('admin/kpis'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "kpis", null);
__decorate([
    (0, common_1.Get)('admin/series'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "series", null);
__decorate([
    (0, common_1.Get)('admin/distribucion'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "distribucion", null);
__decorate([
    (0, common_1.Get)('admin/habilidades'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "habilidades", null);
__decorate([
    (0, common_1.Get)('admin/cohortes'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "cohortes", null);
__decorate([
    (0, common_1.Get)('egresado/:id/kpis'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "egresadoKpis", null);
__decorate([
    (0, common_1.Get)('empresa/:id/kpis'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EstadisticasController.prototype, "empresaKpis", null);
exports.EstadisticasController = EstadisticasController = __decorate([
    (0, common_1.Controller)('estadisticas'),
    __metadata("design:paramtypes", [estadisticas_service_1.EstadisticasService])
], EstadisticasController);
