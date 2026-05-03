import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Controller, Get, Param, Patch, Delete } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @Get(':userName')
  async getByUser(@Param('userName') userName: string) {
    return this.service.findByUser(userName);
  }

  @Patch(':id/leer')
  async markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
