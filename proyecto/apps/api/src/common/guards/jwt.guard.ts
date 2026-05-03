import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private prisma = new PrismaClient();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) throw new UnauthorizedException('Missing authorization header');
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException('Invalid authorization header');
    try {
      const payload: any = jwt.verify(parts[1], JWT_SECRET);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      req.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
