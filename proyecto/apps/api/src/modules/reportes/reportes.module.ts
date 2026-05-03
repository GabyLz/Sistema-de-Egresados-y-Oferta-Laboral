import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [ReportesService],
  controllers: [ReportesController],
  exports: [ReportesService],
})
export class ReportesModule {}
