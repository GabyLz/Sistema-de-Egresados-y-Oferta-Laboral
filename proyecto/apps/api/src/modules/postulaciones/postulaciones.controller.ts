import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly service: PostulacionesService) {}

  @Post()
  async postular(@Body() body: { egresadoId: string; ofertaId: string }) {
    return this.service.create(body.egresadoId, body.ofertaId);
  }

  @Get('egresado/:id')
  async listByEgresado(@Param('id') id: string) {
    return this.service.findByEgresado(id);
  }

  @Get('empresa/:id')
  async listByEmpresa(@Param('id') id: string) {
    return this.service.findByEmpresa(id);
  }

  @Patch(':id/estado')
  async updateStatus(@Param('id') id: string, @Body() body: { estado: string; motivo?: string }) {
    return this.service.updateStatus(id, body.estado, body.motivo);
  }
}
