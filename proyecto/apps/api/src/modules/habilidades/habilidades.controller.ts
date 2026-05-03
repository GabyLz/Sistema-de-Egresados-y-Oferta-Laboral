import { Controller, Get, Post, Put, Body, Delete, Param } from '@nestjs/common';
import { HabilidadesService } from './habilidades.service';

@Controller('habilidades')
export class HabilidadesController {
  constructor(private readonly service: HabilidadesService) {}

  @Get()
  async list() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: { nombre: string; tipo: string; categoria: string }) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { nombre: string; tipo: string; categoria: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('link')
  async link(@Body() body: { egresadoId: string; habilidadId: string; nivel?: number }) {
    return this.service.linkToEgresado(body.egresadoId, body.habilidadId, body.nivel);
  }

  @Delete('egresado/:egresadoId/:habilidadId')
  async removeLink(@Param('egresadoId') egresadoId: string, @Param('habilidadId') habilidadId: string) {
    return this.service.removeLink(egresadoId, habilidadId);
  }
}
