import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly service: EvaluacionesService) {}

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get('postulacion/:id')
  async listByPostulacion(@Param('id') id: string) {
    return this.service.findByPostulacion(id);
  }
}
