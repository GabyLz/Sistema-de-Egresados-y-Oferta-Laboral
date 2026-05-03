import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { EgresadosService } from './egresados.service';

@Controller('egresados')
export class EgresadosController {
  constructor(private readonly service: EgresadosService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('perfil/:id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Post('educacion')
  async addEducacion(@Body() body: any) {
    return this.service.addEducacion(body);
  }

  @Put('educacion/:id')
  async updateEducacion(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEducacion(id, body);
  }

  @Delete('educacion/:id')
  async deleteEducacion(@Param('id') id: string) {
    return this.service.removeEducacion(id);
  }

  @Post('experiencia')
  async addExperiencia(@Body() body: any) {
    return this.service.addExperiencia(body);
  }

  @Put('experiencia/:id')
  async updateExperiencia(@Param('id') id: string, @Body() body: any) {
    return this.service.updateExperiencia(id, body);
  }

  @Delete('experiencia/:id')
  async deleteExperiencia(@Param('id') id: string) {
    return this.service.removeExperiencia(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/asociar')
  async asociar(@Param('id') id: string, @Body() body: { empresaNombre: string; ofertaTitulo: string; ofertaId?: string; empresaId?: string }) {
    return this.service.asociarTalent(id, body);
  }
}
