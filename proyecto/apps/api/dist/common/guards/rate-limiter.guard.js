"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RateLimiterGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterGuard = void 0;
const common_1 = require("@nestjs/common");
let RateLimiterGuard = RateLimiterGuard_1 = class RateLimiterGuard {
    constructor() {
        this.MAX_ATTEMPTS = 100; // Aumentado para desarrollo
        this.WINDOW_MS = 1 * 60 * 1000; // Reducido a 1 minuto para desarrollo
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const now = Date.now();
        const clientData = RateLimiterGuard_1.attempts.get(ip);
        if (!clientData) {
            RateLimiterGuard_1.attempts.set(ip, { count: 1, lastAttempt: now });
            return true;
        }
        if (now - clientData.lastAttempt > this.WINDOW_MS) {
            RateLimiterGuard_1.attempts.set(ip, { count: 1, lastAttempt: now });
            return true;
        }
        if (clientData.count >= this.MAX_ATTEMPTS) {
            throw new common_1.HttpException('Demasiados intentos. Por favor, intente de nuevo en 15 minutos.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        clientData.count++;
        clientData.lastAttempt = now;
        return true;
    }
};
exports.RateLimiterGuard = RateLimiterGuard;
RateLimiterGuard.attempts = new Map();
exports.RateLimiterGuard = RateLimiterGuard = RateLimiterGuard_1 = __decorate([
    (0, common_1.Injectable)()
], RateLimiterGuard);
