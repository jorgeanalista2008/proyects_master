"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async createRole(dto) {
        const existing = await this.prisma.role.findUnique({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un perfil con el nombre ${dto.name}`);
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
    async updateRole(id, dto) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException('Perfil no encontrado.');
        }
        if (role.name === 'ADMIN' && dto.name && dto.name !== 'ADMIN') {
            throw new common_1.ConflictException('No se puede cambiar el nombre del perfil administrador principal.');
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
                await tx.rolePermission.deleteMany({
                    where: { roleId: id },
                });
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
                await tx.roleMenu.deleteMany({
                    where: { roleId: id },
                });
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
    async deleteRole(id) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException('Perfil no encontrado.');
        }
        if (role.name === 'ADMIN') {
            throw new common_1.ConflictException('No es posible eliminar el perfil administrador principal del sistema.');
        }
        return this.prisma.role.delete({
            where: { id },
        });
    }
    async findAllPermissions() {
        return this.prisma.permission.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findAllMenus() {
        return this.prisma.menuItem.findMany({
            orderBy: {
                order: 'asc',
            },
        });
    }
    async createMenu(dto) {
        return this.prisma.menuItem.create({
            data: {
                label: dto.label,
                route: dto.route,
                icon: dto.icon,
                order: dto.order || 0,
            },
        });
    }
    async updateMenu(id, dto) {
        const menu = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!menu) {
            throw new common_1.NotFoundException('Menú no encontrado.');
        }
        return this.prisma.menuItem.update({
            where: { id },
            data: dto,
        });
    }
    async deleteMenu(id) {
        const menu = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!menu) {
            throw new common_1.NotFoundException('Menú no encontrado.');
        }
        return this.prisma.menuItem.delete({
            where: { id },
        });
    }
    async findUserMenu(userId) {
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
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map