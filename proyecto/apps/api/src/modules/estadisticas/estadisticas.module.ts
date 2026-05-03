import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  providers: [EstadisticasService],
  controllers: [EstadisticasController],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}
