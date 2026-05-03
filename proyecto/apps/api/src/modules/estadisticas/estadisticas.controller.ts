import { Controller, Get, Param, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticas: EstadisticasService) {}

  @Get('admin/kpis')
  kpis(@Query() query: any) {
    return this.estadisticas.kpisAdmin(query);
  }

  @Get('admin/series')
  series(@Query() query: any) {
    return this.estadisticas.evolucionMensual(query);
  }

  @Get('admin/distribucion')
  distribucion(@Query() query: any) {
    return this.estadisticas.distribucionPorCarrera(query);
  }

  @Get('admin/habilidades')
  habilidades(@Query() query: any) {
    return this.estadisticas.habilidadesDemandadas(query);
  }

  @Get('admin/cohortes')
  cohortes(@Query() query: any) {
    return this.estadisticas.tasaContratacionPorCohorte(query);
  }

  @Get('egresado/:id/kpis')
  egresadoKpis(@Param('id') id: string) {
    return this.estadisticas.kpisEgresado(id);
  }

  @Get('empresa/:id/kpis')
  empresaKpis(@Param('id') id: string) {
    return this.estadisticas.kpisEmpresa(id);
  }
}
