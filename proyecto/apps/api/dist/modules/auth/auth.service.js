"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma_service_1 = require("../../prisma/prisma.service");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(dto, ipAddress, userAgent) {
        const { email, password, rol } = dto;
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('El correo electrónico ya está registrado');
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
            }
        });
        if (rol === 'egresado') {
            if (!dto.nombres || !dto.apellidos || !dto.dni) {
                throw new common_1.BadRequestException('Datos de egresado incompletos');
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
        }
        else if (rol === 'empresa') {
            if (!dto.razonSocial || !dto.rut) {
                throw new common_1.BadRequestException('Datos de empresa incompletos');
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
                }
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
    async validateUser(email, password, ipAddress, userAgent) {
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
            if (user.rol === 'empresa' && user.empresa?.estado === 'pendiente') {
                console.log(`Empresa pending approval: ${email}`);
                throw new common_1.UnauthorizedException('Su cuenta de empresa está pendiente de aprobación administrativa');
            }
            console.log(`Auth attempt logged for: ${email}`);
            await this.logAuthAttempt(user.id, 'login_success', { email }, ipAddress, userAgent);
            return user;
        }
        catch (error) {
            console.error('Error in AuthService.validateUser:', error);
            throw error;
        }
    }
    async logAuthAttempt(userId, action, details, ipAddress, userAgent) {
        try {
            const prisma = this.prisma;
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    details,
                    ipAddress,
                    userAgent
                }
            });
        }
        catch (error) {
            console.error('Error logging auth attempt:', error);
            // No lanzamos error para no bloquear el login si falla la auditoría
        }
    }
    async login(email, password, ipAddress, userAgent) {
        console.log(`Login attempt for: ${email}`);
        try {
            const user = await this.validateUser(email, password, ipAddress, userAgent);
            if (!user) {
                console.log(`Invalid credentials for: ${email}`);
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            console.log(`User validated: ${user.email} (${user.rol})`);
            const token = jwt.sign({ sub: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '12h' });
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
        }
        catch (error) {
            console.error('Error in AuthService.login:', error);
            throw error;
        }
    }
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return { message: 'Si el correo existe, recibirá un enlace para restablecer su contraseña' };
        const resetToken = Math.random().toString(36).substring(2, 15);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: expires
            }
        });
        // Aquí se enviaría el correo (simulado)
        console.log(`Reset token for ${email}: ${resetToken}`);
        return { message: 'Si el correo existe, recibirá un enlace para restablecer su contraseña' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gte: new Date() }
            }
        });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado');
        const hash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hash,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });
        return { message: 'Contraseña actualizada con éxito' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
