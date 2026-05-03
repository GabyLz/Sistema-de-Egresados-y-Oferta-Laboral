import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [EvaluacionesService, PrismaService],
  controllers: [EvaluacionesController],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
