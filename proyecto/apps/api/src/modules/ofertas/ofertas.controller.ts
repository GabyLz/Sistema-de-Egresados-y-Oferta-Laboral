import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch } from '@nestjs/common';
import { OfertasService } from './ofertas.service';

@Controller('ofertas')
export class OfertasController {
  constructor(private readonly service: OfertasService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/postulaciones')
  async getPostulaciones(@Param('id') id: string) {
    return this.service.findPostulaciones(id);
  }

  @Get('recomendadas/:egresadoId')
  async getRecomendadas(@Param('egresadoId') egresadoId: string) {
    // Por ahora devolvemos las más recientes como recomendadas
    return this.service.findAll({ activa: true });
  }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { estado: string, motivo?: string }) {
    return this.service.updateStatus(id, body.estado, body.motivo);
  }

  @Patch(':id/moderacion')
  async moderate(@Param('id') id: string, @Body() body: { estado: string, comentario?: string }) {
    return this.service.updateStatus(id, body.estado, body.comentario);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

