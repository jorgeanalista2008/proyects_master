import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS DE PERFILES (ROLES) ---

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        menus: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createRole(dto: { name: string; description?: string; permissions?: string[]; menus?: string[] }) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un perfil con el nombre ${dto.name}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      if (dto.permissions && dto.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: dto.permissions.map((permId) => ({
            roleId: role.id,
            permissionId: permId,
          })),
        });
      }

      if (dto.menus && dto.menus.length > 0) {
        await tx.roleMenu.createMany({
          data: dto.menus.map((menuId) => ({
            roleId: role.id,
            menuItemId: menuId,
          })),
        });
      }

      return role;
    });
  }

  async updateRole(id: string, dto: { name?: string; description?: string; permissions?: string[]; menus?: string[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Perfil no encontrado.');
    }

    // No permitir cambiar el nombre de ADMIN para no romper el bypass del guard
    if (role.name === 'ADMIN' && dto.name && dto.name !== 'ADMIN') {
      throw new ConflictException('No se puede cambiar el nombre del perfil administrador principal.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRole = await tx.role.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      if (dto.permissions !== undefined) {
        // Eliminar mapeos antiguos
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Crear nuevos mapeos
        if (dto.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: dto.permissions.map((permId) => ({
              roleId: id,
              permissionId: permId,
            })),
          });
        }
      }

      if (dto.menus !== undefined) {
        // Eliminar mapeos antiguos
        await tx.roleMenu.deleteMany({
          where: { roleId: id },
        });

        // Crear nuevos mapeos
        if (dto.menus.length > 0) {
          await tx.roleMenu.createMany({
            data: dto.menus.map((menuId) => ({
              roleId: id,
              menuItemId: menuId,
            })),
          });
        }
      }

      return updatedRole;
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Perfil no encontrado.');
    }

    if (role.name === 'ADMIN') {
      throw new ConflictException('No es posible eliminar el perfil administrador principal del sistema.');
    }

    // Las relaciones RolePermission y RoleMenu se borrarán en cascada gracias al modelo Prisma
    return this.prisma.role.delete({
      where: { id },
    });
  }

  // --- MÉTODOS DE PERMISOS ---

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  // --- MÉTODOS DE MENÚS ---

  async findAllMenus() {
    return this.prisma.menuItem.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async createMenu(dto: { label: string; route: string; icon: string; order?: number }) {
    return this.prisma.menuItem.create({
      data: {
        label: dto.label,
        route: dto.route,
        icon: dto.icon,
        order: dto.order || 0,
      },
    });
  }

  async updateMenu(id: string, dto: { label?: string; route?: string; icon?: string; order?: number }) {
    const menu = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('Menú no encontrado.');
    }
    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMenu(id: string) {
    const menu = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('Menú no encontrado.');
    }
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  async findUserMenu(userId: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            menus: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    if (!dbUser || !dbUser.role) {
      return [];
    }

    const menus = dbUser.role.menus.map((rm) => rm.menuItem);
    return menus.sort((a, b) => a.order - b.order);
  }
}
