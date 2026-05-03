import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_ATTEMPTS = 100; // Aumentado para desarrollo
  private readonly WINDOW_MS = 1 * 60 * 1000; // Reducido a 1 minuto para desarrollo

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const now = Date.now();
    const clientData = RateLimiterGuard.attempts.get(ip);

    if (!clientData) {
      RateLimiterGuard.attempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - clientData.lastAttempt > this.WINDOW_MS) {
      RateLimiterGuard.attempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    if (clientData.count >= this.MAX_ATTEMPTS) {
      throw new HttpException(
        'Demasiados intentos. Por favor, intente de nuevo en 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    clientData.count++;
    clientData.lastAttempt = now;
    return true;
  }
}
