// d:\github\proyects_master\backend\src\technicians\technicians.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('technicians')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  @Permissions('technicians:write')
  create(@Body() createTechnicianDto: CreateTechnicianDto) {
    return this.techniciansService.create(createTechnicianDto);
  }

  @Get()
  @Permissions('technicians:read')
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  @Permissions('technicians:read')
  findOne(
    @Param('id') id: string,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden ver sus detalles
    if (reqUserRole !== 'ADMIN' && reqUserRole !== 'SELLER' && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para ver este perfil.');
    }
    return this.techniciansService.findOne(id);
  }

  @Patch(':id')
  @Permissions('technicians:write')
  update(
    @Param('id') id: string,
    @Body() updateTechnicianDto: UpdateTechnicianDto,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden editar
    if (reqUserRole !== 'ADMIN' && reqUserRole !== 'SELLER' && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para modificar este perfil.');
    }
    return this.techniciansService.update(id, updateTechnicianDto);
  }

  @Delete(':id')
  @Permissions('technicians:write')
  remove(@Param('id') id: string) {
    return this.techniciansService.remove(id);
  }

  @Post(':id/photo')
  @Permissions('technicians:write')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden cambiar la foto
    if (reqUserRole !== 'ADMIN' && reqUserRole !== 'SELLER' && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para cambiar la foto de este perfil.');
    }
    return this.techniciansService.uploadPhoto(id, file);
  }
}
