"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluacionesModule = void 0;
const common_1 = require("@nestjs/common");
const evaluaciones_service_1 = require("./evaluaciones.service");
const evaluaciones_controller_1 = require("./evaluaciones.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let EvaluacionesModule = class EvaluacionesModule {
};
exports.EvaluacionesModule = EvaluacionesModule;
exports.EvaluacionesModule = EvaluacionesModule = __decorate([
    (0, common_1.Module)({
        providers: [evaluaciones_service_1.EvaluacionesService, prisma_service_1.PrismaService, notificaciones_service_1.NotificacionesService],
        controllers: [evaluaciones_controller_1.EvaluacionesController],
        exports: [evaluaciones_service_1.EvaluacionesService],
    })
], EvaluacionesModule);
