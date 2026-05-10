import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly service: EvaluacionesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    // Usar el ID del usuario autenticado desde el JWT, no el enviado en el body
    return this.service.create({
      ...body,
      empresaId: req.user.id
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('postulacion/:id')
  async listByPostulacion(@Param('id') id: string) {
    return this.service.findByPostulacion(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('egresado/:egresadoId')
  async getEvaluacionesEgresado(@Param('egresadoId') egresadoId: string) {
    return this.service.findByEgresado(egresadoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('empresa/:empresaId')
  async getEvaluacionesEmpresa(@Param('empresaId') empresaId: string) {
    return this.service.findByEmpresa(empresaId);
  }
}
