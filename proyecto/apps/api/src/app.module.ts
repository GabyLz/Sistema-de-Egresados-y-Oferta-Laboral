import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { EgresadosModule } from './modules/egresados/egresados.module';
import { OfertasModule } from './modules/ofertas/ofertas.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { PostulacionesModule } from './modules/postulaciones/postulaciones.module';
import { HabilidadesModule } from './modules/habilidades/habilidades.module';
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EgresadosModule,
    OfertasModule,
    ReportesModule,
    EstadisticasModule,
    EmpresasModule,
    PostulacionesModule,
    HabilidadesModule,
    EvaluacionesModule,
    NotificacionesModule,
  ],
})

export class AppModule {}
