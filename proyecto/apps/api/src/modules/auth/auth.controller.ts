import { Controller, Post, Body, Req, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { RateLimiterGuard } from '../../common/guards/rate-limiter.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RateLimiterGuard)
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] as string;
    return this.authService.register(dto, ip, ua);
  }

  @Post('login')
  @UseGuards(RateLimiterGuard)
  async login(@Body() body: any, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] as string;
    return this.authService.login(body.email, body.password, ip, ua);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: any) {
    return this.authService.resetPassword(token, password);
  }
}
