import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[] = []) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.rol) return false;
    return this.allowedRoles.includes(user.rol);
  }
}

export function Roles(...roles: string[]) {
  return new RolesGuard(roles);
}
