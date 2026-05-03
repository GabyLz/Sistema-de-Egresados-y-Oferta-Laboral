import { Module } from '@nestjs/common';
import { EgresadosService, EgresadosController } from './egresados';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  providers: [EgresadosService],
  controllers: [EgresadosController],
  exports: [EgresadosService],
})
export class EgresadosModule {}