import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
