"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./modules/auth/auth.module");
const egresados_module_1 = require("./modules/egresados/egresados.module");
const ofertas_module_1 = require("./modules/ofertas/ofertas.module");
const reportes_module_1 = require("./modules/reportes/reportes.module");
const estadisticas_module_1 = require("./modules/estadisticas/estadisticas.module");
const empresas_module_1 = require("./modules/empresas/empresas.module");
const postulaciones_module_1 = require("./modules/postulaciones/postulaciones.module");
const habilidades_module_1 = require("./modules/habilidades/habilidades.module");
const evaluaciones_module_1 = require("./modules/evaluaciones/evaluaciones.module");
const notificaciones_module_1 = require("./modules/notificaciones/notificaciones.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            egresados_module_1.EgresadosModule,
            ofertas_module_1.OfertasModule,
            reportes_module_1.ReportesModule,
            estadisticas_module_1.EstadisticasModule,
            empresas_module_1.EmpresasModule,
            postulaciones_module_1.PostulacionesModule,
            habilidades_module_1.HabilidadesModule,
            evaluaciones_module_1.EvaluacionesModule,
            notificaciones_module_1.NotificacionesModule,
        ],
    })
], AppModule);
