import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Module({
  providers: [EvaluacionesService, PrismaService, NotificacionesService],
  controllers: [EvaluacionesController],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
