import { IsString, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateEgresadoDto {
  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  carrera?: string;

  @IsOptional()
  @IsInt()
  anio_egreso?: number;

  @IsOptional()
  @IsBoolean()
  empleado_actualmente?: boolean;
}
