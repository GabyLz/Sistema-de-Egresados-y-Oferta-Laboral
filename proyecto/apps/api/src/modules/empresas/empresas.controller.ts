import { Controller, Get, Patch, Param, Body, Delete, Put, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EmpresasService } from './empresas.service';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  @Get()
  async list() {
    return this.service.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { estado: string, motivo?: string }) {
    return this.service.updateStatus(id, body.estado, body.motivo);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('logo/upload')
  async uploadLogo(@Body() body: { empresaId: string, file: any }) {
    // Simulación de upload
    const logoUrl = `https://placehold.co/200x200?text=Logo+${body.empresaId}`;
    return this.service.updateLogo(body.empresaId, logoUrl);
  }
}

