import { IsEmail, IsNotEmpty, IsIn, IsOptional, MinLength, Matches, Length, IsInt, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Formato de correo electrónico inválido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña es demasiado débil (debe incluir mayúsculas, minúsculas y números)',
  })
  password: string;

  @IsIn(['admin', 'egresado', 'empresa'], { message: 'Rol inválido' })
  rol: string;

  // Campos Egresado
  @IsOptional()
  nombres?: string;

  @IsOptional()
  apellidos?: string;

  @IsOptional()
  @Length(8, 20, { message: 'DNI inválido' })
  dni?: string;

  @IsOptional()
  carrera?: string;

  @IsOptional()
  @IsInt()
  @Min(2016)
  @Max(2026)
  anioEgreso?: number;

  @IsOptional()
  habilidadesIds?: string[];

  // Campos Egresado - Formación Académica
  @IsOptional()
  institucion?: string;

  @IsOptional()
  titulo?: string;

  @IsOptional()
  fechaInicio?: string;

  @IsOptional()
  fechaFin?: string;

  // Campos Empresa
  @IsOptional()
  razonSocial?: string;

  @IsOptional()
  nombreComercial?: string;

  @IsOptional()
  @Length(11, 11, { message: 'RUC debe tener 11 dígitos' })
  rut?: string; // RUC

  @IsOptional()
  telefono?: string;

  @IsOptional()
  descripcion?: string;
}
