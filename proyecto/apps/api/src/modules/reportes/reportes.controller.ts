import { Controller, Post, Body } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Post('enqueue')
  async enqueue(@Body() body: any) {
    const { tipo, parametros, usuarioId } = body;
    return this.service.solicitarReporte(usuarioId, tipo, parametros);
  }

  @Post('historial')
  async getHistorial(@Body() body: any) {
    return this.service.findByUser(body.usuarioId);
  }

  @Post('generar')
  async generar(@Body() body: any) {
    const { reporteId, tipo, parametros } = body;
    return this.service.generarYAlmacenarReporte({ reporteId, tipo, parametros });
  }

  @Post('obtener/:id')
  async obtener(@Body() body: any) {
    return this.service.obtenerReporte(body.id);
  }
}
