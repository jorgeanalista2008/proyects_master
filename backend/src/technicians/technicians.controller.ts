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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RoleName } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  create(@Body() createTechnicianDto: CreateTechnicianDto) {
    return this.techniciansService.create(createTechnicianDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden ver sus detalles
    if (reqUserRole !== RoleName.ADMIN && reqUserRole !== RoleName.SELLER && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para ver este perfil.');
    }
    return this.techniciansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechnicianDto: UpdateTechnicianDto,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden editar
    if (reqUserRole !== RoleName.ADMIN && reqUserRole !== RoleName.SELLER && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para modificar este perfil.');
    }
    return this.techniciansService.update(id, updateTechnicianDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  remove(@Param('id') id: string) {
    return this.techniciansService.remove(id);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('sub') reqUserId: string,
    @GetUser('role') reqUserRole: string,
  ) {
    // Solo ADMIN, SELLER, o el propio técnico pueden cambiar la foto
    if (reqUserRole !== RoleName.ADMIN && reqUserRole !== RoleName.SELLER && reqUserId !== id) {
      throw new ForbiddenException('No tiene permisos para cambiar la foto de este perfil.');
    }
    return this.techniciansService.uploadPhoto(id, file);
  }
}
