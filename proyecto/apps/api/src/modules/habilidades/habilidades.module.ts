import { Module } from '@nestjs/common';
import { HabilidadesController } from './habilidades.controller';
import { HabilidadesService } from './habilidades.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HabilidadesController],
  providers: [HabilidadesService],
})
export class HabilidadesModule {}
