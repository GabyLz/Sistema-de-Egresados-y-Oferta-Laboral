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
exports.EstadisticasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let EstadisticasService = class EstadisticasService {
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    getDateFilters(filtros) {
        const fechaInicio = filtros?.fechaInicio || filtros?.start || filtros?.startDate || filtros?.desde || '';
        const fechaFin = filtros?.fechaFin || filtros?.end || filtros?.endDate || filtros?.hasta || '';
        return { fechaInicio, fechaFin };
    }
    buildDateWhere(filtros) {
        const { fechaInicio, fechaFin } = this.getDateFilters(filtros);
        if (!fechaInicio && !fechaFin)
            return undefined;
        const where = {};
        if (fechaInicio)
            where.gte = new Date(fechaInicio);
        if (fechaFin)
            where.lte = new Date(fechaFin);
        return where;
    }
    async kpisAdmin(filtros) {
        const prisma = this.prisma;
        const { carrera, empresa } = filtros || {};
        const dateRange = this.buildDateWhere(filtros);
        const whereEgresado = {};
        if (carrera)
            whereEgresado.carrera = carrera;
        if (dateRange) {
            whereEgresado.updatedAt = dateRange;
        }
        const whereOferta = { activa: true };
        if (empresa)
            whereOferta.empresaId = empresa;
        if (dateRange) {
            whereOferta.createdAt = dateRange;
        }
        const wherePostulacion = {};
        if (dateRange) {
            wherePostulacion.fechaPostulacion = dateRange;
        }
        const [totalEgresados, totalEmpresas, ofertasActivas, totalPostulaciones, egresadosEmpleados, egresadosContratados] = await Promise.all([
            prisma.egresado.count({ where: whereEgresado }),
            prisma.empresa.count(),
            prisma.ofertaLaboral.count({ where: whereOferta }),
            prisma.postulacion.count({ where: wherePostulacion }),
            prisma.egresado.findMany({ where: { ...whereEgresado, empleadoActualmente: true }, select: { id: true } }),
            prisma.postulacion.findMany({
                where: {
                    estado: 'contratado',
                    ...(dateRange ? { fechaPostulacion: dateRange } : {}),
                    egresado: whereEgresado,
                },
                select: { egresadoId: true },
            }),
        ]);
        const egresadosConEmpleo = new Set([
            ...egresadosEmpleados.map((egresado) => egresado.id),
            ...egresadosContratados.map((postulacion) => postulacion.egresadoId),
        ]);
        const tasaEmpleabilidad = totalEgresados > 0
            ? Math.round((egresadosConEmpleo.size / totalEgresados) * 100)
            : 0;
        return { totalEgresados, totalEmpresas, ofertasActivas, totalPostulaciones, tasaEmpleabilidad };
    }
    async distribucionPorCarrera(filtros) {
        const prisma = this.prisma;
        const dateRange = this.buildDateWhere(filtros);
        const where = {};
        if (dateRange) {
            where.updatedAt = dateRange;
        }
        const egresados = await prisma.egresado.findMany({
            where,
            select: { carrera: true }
        });
        const distribucion = {};
        egresados.forEach((e) => {
            const c = e.carrera || 'Otras';
            distribucion[c] = (distribucion[c] || 0) + 1;
        });
        return Object.entries(distribucion).map(([name, value]) => ({ name, value }));
    }
    async habilidadesDemandadas(filtros) {
        const prisma = this.prisma;
        const { empresa } = filtros || {};
        const dateRange = this.buildDateWhere(filtros);
        const where = {};
        if (empresa)
            where.empresaId = empresa;
        if (dateRange) {
            where.createdAt = dateRange;
        }
        const ofertas = await prisma.ofertaLaboral.findMany({
            where,
            include: { ofertaHabilidades: { include: { habilidad: true } } }
        });
        const conteo = {};
        ofertas.forEach((o) => {
            o.ofertaHabilidades.forEach((oh) => {
                const nombre = oh.habilidad.nombre;
                conteo[nombre] = (conteo[nombre] || 0) + 1;
            });
        });
        return Object.entries(conteo)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }
    async tasaContratacionPorCohorte(filtros) {
        const prisma = this.prisma;
        const { carrera } = filtros || {};
        const where = {};
        if (carrera)
            where.carrera = carrera;
        const egresados = await prisma.egresado.findMany({ where });
        const cohortes = {};
        egresados.forEach((e) => {
            const anio = e.anioEgreso;
            if (!cohortes[anio])
                cohortes[anio] = { total: 0, empleados: 0 };
            cohortes[anio].total++;
            if (e.empleadoActualmente)
                cohortes[anio].empleados++;
        });
        return Object.entries(cohortes).map(([anio, data]) => ({
            anio: parseInt(anio),
            tasa: Math.round((data.empleados / data.total) * 100),
            total: data.total,
            empleados: data.empleados
        })).sort((a, b) => b.anio - a.anio);
    }
    async evolucionMensual(filtros) {
        const prisma = this.prisma;
        const dateRange = this.buildDateWhere(filtros);
        const now = new Date();
        const end = dateRange?.lte instanceof Date ? dateRange.lte : now;
        const start = dateRange?.gte instanceof Date
            ? dateRange.gte
            : new Date(end.getFullYear(), end.getMonth() - 5, 1);
        const months = [];
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cursor <= end) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                key,
                label: cursor.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
            });
            cursor.setMonth(cursor.getMonth() + 1);
        }
        const rangeWhere = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const [ofertas, postulaciones] = await Promise.all([
            prisma.ofertaLaboral.findMany({ where: rangeWhere, select: { createdAt: true } }),
            prisma.postulacion.findMany({ where: { fechaPostulacion: { gte: start, lte: end } }, select: { fechaPostulacion: true } }),
        ]);
        const grouped = months.reduce((acc, month) => {
            acc[month.key] = { name: month.label, a: 0, b: 0 };
            return acc;
        }, {});
        ofertas.forEach((item) => {
            const d = new Date(item.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (grouped[key])
                grouped[key].a += 1;
        });
        postulaciones.forEach((item) => {
            const d = new Date(item.fechaPostulacion);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (grouped[key])
                grouped[key].b += 1;
        });
        return months.map((month) => grouped[month.key]);
    }
    async kpisEgresado(egresadoId) {
        const prisma = this.prisma;
        const [totalPostulaciones, egresado, totalOfertas] = await Promise.all([
            prisma.postulacion.count({ where: { egresadoId } }),
            prisma.egresado.findUnique({
                where: { id: egresadoId },
                include: {
                    postulaciones: true,
                    egresadoHabilidades: true,
                    experienciasLaborales: true,
                    formacionesAcademicas: true
                }
            }),
            prisma.ofertaLaboral.count({ where: { estado: 'Aprobada', activa: true } })
        ]);
        const respuestas = egresado?.postulaciones.filter((p) => p.estado?.toLowerCase() !== 'postulado').length || 0;
        const tasaRespuesta = totalPostulaciones > 0 ? Math.round((respuestas / totalPostulaciones) * 100) : 0;
        // Cálculo básico de completitud de perfil
        let puntos = 0;
        if (egresado?.telefono)
            puntos += 20;
        if (egresado?.direccion)
            puntos += 20;
        if (egresado?.egresadoHabilidades?.length > 0)
            puntos += 20;
        if (egresado?.experienciasLaborales?.length > 0)
            puntos += 20;
        if (egresado?.formacionesAcademicas?.length > 0)
            puntos += 20;
        return {
            totalPostulaciones,
            ofertasVistas: 0,
            tasaRespuesta,
            perfilCompletado: puntos,
            ofertasAplicables: totalOfertas
        };
    }
    async kpisEmpresa(empresaId) {
        const prisma = this.prisma;
        // Trigger reminders check
        this.notificacionesService.checkClosingDates().catch(e => console.error('Error checking closing dates:', e));
        const [ofertas, postulaciones] = await Promise.all([
            prisma.ofertaLaboral.findMany({
                where: { empresaId },
                include: { postulaciones: true }
            }),
            prisma.postulacion.findMany({
                where: { oferta: { empresaId } },
                include: { oferta: true }
            })
        ]);
        const totalOfertas = ofertas.length;
        const ofertasActivas = ofertas.filter((o) => o.estado === 'Aprobada' && o.activa).length;
        const totalPostulaciones = postulaciones.length;
        const totalContratados = postulaciones.filter((p) => p.estado?.toLowerCase() === 'contratado').length;
        const enRevision = postulaciones.filter((p) => p.estado?.toLowerCase() === 'en revisión' ||
            p.estado?.toLowerCase() === 'revision' ||
            p.estado?.toLowerCase() === 'revisión').length;
        const totalEntrevistas = postulaciones.filter((p) => p.estado?.toLowerCase() === 'entrevista' ||
            p.estado?.toLowerCase() === 'entrevistado').length;
        const tasaConversion = totalPostulaciones > 0 ? Math.round((totalContratados / totalPostulaciones) * 100) : 0;
        const rendimientoOfertas = ofertas.map((o) => {
            const posts = o.postulaciones;
            const contratados = posts.filter((p) => p.estado === 'Contratado').length;
            return {
                titulo: o.titulo,
                totalPostulaciones: posts.length,
                enRevision: posts.filter((p) => p.estado === 'En revisión').length,
                tasaConversion: posts.length > 0 ? Math.round((contratados / posts.length) * 100) : 0,
                estado: o.estado
            };
        });
        const contratadosPostulaciones = postulaciones.filter((p) => p.estado.toLowerCase() === 'contratado');
        let tiempoPromedioContratacion = 0;
        if (contratadosPostulaciones.length > 0) {
            const sumaDias = contratadosPostulaciones.reduce((acc, p) => {
                const inicio = new Date(p.fechaPostulacion).getTime();
                const fin = new Date(p.updatedAt).getTime();
                const diffDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
                return acc + Math.max(0, diffDias);
            }, 0);
            tiempoPromedioContratacion = Math.round(sumaDias / contratadosPostulaciones.length);
        }
        return {
            totalOfertas,
            ofertasActivas,
            totalPostulaciones,
            totalContratados,
            enRevision,
            totalEntrevistas,
            tasaConversion,
            rendimientoOfertas,
            tiempoPromedioContratacion
        };
    }
};
exports.EstadisticasService = EstadisticasService;
exports.EstadisticasService = EstadisticasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], EstadisticasService);
