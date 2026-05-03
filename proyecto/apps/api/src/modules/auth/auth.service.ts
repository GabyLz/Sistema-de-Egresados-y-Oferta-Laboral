import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const { email, password, rol } = dto;
    
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Generar token de verificación (simplificado para este ejemplo)
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const user = await this.prisma.user.create({ 
      data: { 
        email, 
        passwordHash: hash, 
        rol,
        verificationToken,
        isVerified: false
      } as any
    });

    if (rol === 'egresado') {
      if (!dto.nombres || !dto.apellidos || !dto.dni) {
        throw new BadRequestException('Datos de egresado incompletos');
      }
      
      const egresado = await this.prisma.egresado.create({ 
        data: { 
          id: user.id, 
          nombres: dto.nombres, 
          apellidos: dto.apellidos, 
          dni: dto.dni,
          carrera: dto.carrera,
          anioEgreso: dto.anioEgreso,
        } 
      });

      if (dto.habilidadesIds && dto.habilidadesIds.length > 0) {
        await this.prisma.egresadoHabilidad.createMany({
          data: dto.habilidadesIds.map(hId => ({
            egresadoId: egresado.id,
            habilidadId: hId,
            nivel: 1
          }))
        });
      }

      // Registro de Formación Académica
      if (dto.institucion && dto.titulo && dto.fechaInicio) {
        await this.prisma.formacionAcademica.create({
          data: {
            egresadoId: egresado.id,
            institucion: dto.institucion,
            titulo: dto.titulo,
            fechaInicio: new Date(dto.fechaInicio),
            fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null
          }
        });
      }
    } else if (rol === 'empresa') {
      if (!dto.razonSocial || !dto.rut) {
        throw new BadRequestException('Datos de empresa incompletos');
      }
      
      await this.prisma.empresa.create({ 
        data: { 
          id: user.id, 
          razonSocial: dto.razonSocial, 
          nombreComercial: dto.nombreComercial,
          rut: dto.rut,
          telefono: dto.telefono,
          descripcion: dto.descripcion,
          estado: 'pendiente' // Requiere aprobación manual
        } as any
      });
    }

    // Registro de auditoría
    await this.logAuthAttempt(user.id, 'register', { rol: user.rol }, ipAddress, userAgent);

    return { 
      id: user.id, 
      email: user.email, 
      rol: user.rol,
      message: 'Usuario registrado con éxito. Por favor verifique su correo.' 
    };
  }

  async validateUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
    console.log(`Validating user: ${email}`);
    try {
      const user = await this.prisma.user.findUnique({ 
        where: { email },
        include: { empresa: true }
      });
      
      if (!user) {
        console.log(`User not found: ${email}`);
        await this.logAuthAttempt(null, 'login_failed_user_not_found', { email }, ipAddress, userAgent);
        return null;
      }

      console.log(`User found, comparing password for: ${email}`);
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        console.log(`Wrong password for: ${email}`);
        await this.logAuthAttempt(user.id, 'login_failed_wrong_password', { email }, ipAddress, userAgent);
        return null;
      }

      if (user.rol === 'empresa' && (user.empresa as any)?.estado === 'pendiente') {
        console.log(`Empresa pending approval: ${email}`);
        throw new UnauthorizedException('Su cuenta de empresa está pendiente de aprobación administrativa');
      }

      console.log(`Auth attempt logged for: ${email}`);
      await this.logAuthAttempt(user.id, 'login_success', { email }, ipAddress, userAgent);
      return user;
    } catch (error) {
      console.error('Error in AuthService.validateUser:', error);
      throw error;
    }
  }

  private async logAuthAttempt(userId: string | null, action: string, details: any, ipAddress?: string, userAgent?: string) {
    try {
      const prisma: any = this.prisma;
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details,
          ipAddress,
          userAgent
        }
      });
    } catch (error) {
      console.error('Error logging auth attempt:', error);
      // No lanzamos error para no bloquear el login si falla la auditoría
    }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    console.log(`Login attempt for: ${email}`);
    try {
      const user = await this.validateUser(email, password, ipAddress, userAgent);
      if (!user) {
        console.log(`Invalid credentials for: ${email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }
      
      console.log(`User validated: ${user.email} (${user.rol})`);

      const token = jwt.sign(
        { sub: user.id, email: user.email, rol: user.rol }, 
        JWT_SECRET, 
        { expiresIn: '12h' }
      );
      
      const result = { 
        access_token: token, 
        token, 
        rol: user.rol, 
        email: user.email, 
        id: user.id,
        userName: user.rol === 'egresado' ? email : (user.empresa?.razonSocial || email)
      };
      console.log('Login successful');
      return result;
    } catch (error) {
      console.error('Error in AuthService.login:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si el correo existe, recibirá un enlace para restablecer su contraseña' };

    const resetToken = Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires
      } as any
    });

    // Aquí se enviaría el correo (simulado)
    console.log(`Reset token for ${email}: ${resetToken}`);

    return { message: 'Si el correo existe, recibirá un enlace para restablecer su contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() }
      } as any
    });

    if (!user) throw new BadRequestException('Token inválido o expirado');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      } as any
    });

    return { message: 'Contraseña actualizada con éxito' };
  }
}
