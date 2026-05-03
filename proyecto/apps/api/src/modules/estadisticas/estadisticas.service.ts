import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class EstadisticasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private getDateFilters(filtros?: any) {
    const fechaInicio = filtros?.fechaInicio || filtros?.start || filtros?.startDate || filtros?.desde || '';
    const fechaFin = filtros?.fechaFin || filtros?.end || filtros?.endDate || filtros?.hasta || '';

    return { fechaInicio, fechaFin };
  }

  private buildDateWhere(filtros?: any) {
    const { fechaInicio, fechaFin } = this.getDateFilters(filtros);
    if (!fechaInicio && !fechaFin) return undefined;

    const where: any = {};
    if (fechaInicio) where.gte = new Date(fechaInicio);
    if (fechaFin) where.lte = new Date(fechaFin);
    return where;
  }

  async kpisAdmin(filtros?: any) {
    const prisma: any = this.prisma;
    const { carrera, empresa } = filtros || {};
    const dateRange = this.buildDateWhere(filtros);

    const whereEgresado: any = {};
    if (carrera) whereEgresado.carrera = carrera;
    if (dateRange) {
      whereEgresado.updatedAt = dateRange;
    }

    const whereOferta: any = { activa: true };
    if (empresa) whereOferta.empresaId = empresa;
    if (dateRange) {
      whereOferta.createdAt = dateRange;
    }

    const wherePostulacion: any = {};
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

    const egresadosConEmpleo = new Set<string>([
      ...egresadosEmpleados.map((egresado: any) => egresado.id),
      ...egresadosContratados.map((postulacion: any) => postulacion.egresadoId),
    ]);

    const tasaEmpleabilidad = totalEgresados > 0 
      ? Math.round((egresadosConEmpleo.size / totalEgresados) * 100) 
      : 0;

    return { totalEgresados, totalEmpresas, ofertasActivas, totalPostulaciones, tasaEmpleabilidad };
  }

  async distribucionPorCarrera(filtros?: any) {
    const prisma: any = this.prisma;
    const dateRange = this.buildDateWhere(filtros);

    const where: any = {};
    if (dateRange) {
      where.updatedAt = dateRange;
    }

    const egresados = await prisma.egresado.findMany({
      where,
      select: { carrera: true }
    });
    
    const distribucion: any = {};
    egresados.forEach((e: any) => {
      const c = e.carrera || 'Otras';
      distribucion[c] = (distribucion[c] || 0) + 1;
    });

    return Object.entries(distribucion).map(([name, value]) => ({ name, value }));
  }

  async habilidadesDemandadas(filtros?: any) {
    const prisma: any = this.prisma;
    const { empresa } = filtros || {};
    const dateRange = this.buildDateWhere(filtros);

    const where: any = {};
    if (empresa) where.empresaId = empresa;
    if (dateRange) {
      where.createdAt = dateRange;
    }

    const ofertas = await prisma.ofertaLaboral.findMany({
      where,
      include: { ofertaHabilidades: { include: { habilidad: true } } }
    });

    const conteo: any = {};
    ofertas.forEach((o: any) => {
      o.ofertaHabilidades.forEach((oh: any) => {
        const nombre = oh.habilidad.nombre;
        conteo[nombre] = (conteo[nombre] || 0) + 1;
      });
    });

    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);
  }

  async tasaContratacionPorCohorte(filtros?: any) {
    const prisma: any = this.prisma;
    const { carrera } = filtros || {};
    
    const where: any = {};
    if (carrera) where.carrera = carrera;

    const egresados = await prisma.egresado.findMany({ where });
    
    const cohortes: any = {};
    egresados.forEach((e: any) => {
      const anio = e.anioEgreso;
      if (!cohortes[anio]) cohortes[anio] = { total: 0, empleados: 0 };
      cohortes[anio].total++;
      if (e.empleadoActualmente) cohortes[anio].empleados++;
    });

    return Object.entries(cohortes).map(([anio, data]: [string, any]) => ({
      anio: parseInt(anio),
      tasa: Math.round((data.empleados / data.total) * 100),
      total: data.total,
      empleados: data.empleados
    })).sort((a, b) => b.anio - a.anio);
  }

  async evolucionMensual(filtros?: any) {
    const prisma: any = this.prisma;
    const dateRange = this.buildDateWhere(filtros);

    const now = new Date();
    const end = dateRange?.lte instanceof Date ? dateRange.lte : now;
    const start = dateRange?.gte instanceof Date
      ? dateRange.gte
      : new Date(end.getFullYear(), end.getMonth() - 5, 1);

    const months: Array<{ key: string; label: string }> = [];
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

    const grouped = months.reduce((acc: any, month) => {
      acc[month.key] = { name: month.label, a: 0, b: 0 };
      return acc;
    }, {});

    ofertas.forEach((item: any) => {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (grouped[key]) grouped[key].a += 1;
    });

    postulaciones.forEach((item: any) => {
      const d = new Date(item.fechaPostulacion);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (grouped[key]) grouped[key].b += 1;
    });

    return months.map((month) => grouped[month.key]);
  }

  async kpisEgresado(egresadoId: string) {
    const prisma: any = this.prisma;
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
    
    const respuestas = egresado?.postulaciones.filter((p: any) => p.estado?.toLowerCase() !== 'postulado').length || 0;
    const tasaRespuesta = totalPostulaciones > 0 ? Math.round((respuestas / totalPostulaciones) * 100) : 0;

    // Cálculo básico de completitud de perfil
    let puntos = 0;
    if (egresado?.telefono) puntos += 20;
    if (egresado?.direccion) puntos += 20;
    if (egresado?.egresadoHabilidades?.length > 0) puntos += 20;
    if (egresado?.experienciasLaborales?.length > 0) puntos += 20;
    if (egresado?.formacionesAcademicas?.length > 0) puntos += 20;

    return { 
      totalPostulaciones, 
      ofertasVistas: 0, 
      tasaRespuesta, 
      perfilCompletado: puntos,
      ofertasAplicables: totalOfertas
    };
  }

  async kpisEmpresa(empresaId: string) {
    const prisma: any = this.prisma;
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
    const ofertasActivas = ofertas.filter((o: any) => o.estado === 'Aprobada' && o.activa).length;
    const totalPostulaciones = postulaciones.length;
    const totalContratados = postulaciones.filter((p: any) => p.estado?.toLowerCase() === 'contratado').length;
    const enRevision = postulaciones.filter((p: any) => 
      p.estado?.toLowerCase() === 'en revisión' || 
      p.estado?.toLowerCase() === 'revision' || 
      p.estado?.toLowerCase() === 'revisión'
    ).length;
    const totalEntrevistas = postulaciones.filter((p: any) => 
      p.estado?.toLowerCase() === 'entrevista' || 
      p.estado?.toLowerCase() === 'entrevistado'
    ).length;

    const tasaConversion = totalPostulaciones > 0 ? Math.round((totalContratados / totalPostulaciones) * 100) : 0;

    const rendimientoOfertas = ofertas.map((o: any) => {
      const posts = o.postulaciones;
      const contratados = posts.filter((p: any) => p.estado === 'Contratado').length;
      return {
        titulo: o.titulo,
        totalPostulaciones: posts.length,
        enRevision: posts.filter((p: any) => p.estado === 'En revisión').length,
        tasaConversion: posts.length > 0 ? Math.round((contratados / posts.length) * 100) : 0,
        estado: o.estado
      };
    });

    const contratadosPostulaciones = postulaciones.filter((p: any) => p.estado.toLowerCase() === 'contratado');
    let tiempoPromedioContratacion = 0;
    
    if (contratadosPostulaciones.length > 0) {
      const sumaDias = contratadosPostulaciones.reduce((acc: number, p: any) => {
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

}
