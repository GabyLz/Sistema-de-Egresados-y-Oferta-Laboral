"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostulacionesModule = void 0;
const common_1 = require("@nestjs/common");
const postulaciones_controller_1 = require("./postulaciones.controller");
const postulaciones_service_1 = require("./postulaciones.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const notificaciones_module_1 = require("../notificaciones/notificaciones.module");
let PostulacionesModule = class PostulacionesModule {
};
exports.PostulacionesModule = PostulacionesModule;
exports.PostulacionesModule = PostulacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notificaciones_module_1.NotificacionesModule],
        controllers: [postulaciones_controller_1.PostulacionesController],
        providers: [postulaciones_service_1.PostulacionesService],
    })
], PostulacionesModule);
