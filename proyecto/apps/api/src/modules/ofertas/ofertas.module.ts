import { Module } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  providers: [OfertasService],
  controllers: [OfertasController],
  exports: [OfertasService],
})
export class OfertasModule {}
