import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Roles y Permisos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // --- OBTENER MENÚ DEL USUARIO AUTENTICADO ---
  @Get('my-menu')
  findMyMenu(@Req() req: any) {
    return this.rolesService.findUserMenu(req.user.sub);
  }

  // --- CRUD DE PERFILES (ROLES) ---
  @Get()
  @Permissions('users:write')
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Post()
  @Permissions('users:write')
  createRole(
    @Body() dto: { name: string; description?: string; permissions?: string[]; menus?: string[] },
  ) {
    return this.rolesService.createRole(dto);
  }

  @Patch(':id')
  @Permissions('users:write')
  updateRole(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; permissions?: string[]; menus?: string[] },
  ) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @Permissions('users:write')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  // --- OBTENER PERMISOS DISPONIBLES ---
  @Get('permissions')
  @Permissions('users:write')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  // --- CRUD DE MENÚS ---
  @Get('menus')
  @Permissions('users:write')
  findAllMenus() {
    return this.rolesService.findAllMenus();
  }

  @Post('menus')
  @Permissions('users:write')
  createMenu(@Body() dto: { label: string; route: string; icon: string; order?: number }) {
    return this.rolesService.createMenu(dto);
  }

  @Patch('menus/:id')
  @Permissions('users:write')
  updateMenu(
    @Param('id') id: string,
    @Body() dto: { label?: string; route?: string; icon?: string; order?: number },
  ) {
    return this.rolesService.updateMenu(id, dto);
  }

  @Delete('menus/:id')
  @Permissions('users:write')
  deleteMenu(@Param('id') id: string) {
    return this.rolesService.deleteMenu(id);
  }
}
