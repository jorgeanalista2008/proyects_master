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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto) {
        const { name, description, clientId, managerId, status } = createProjectDto;
        const client = await this.prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            throw new common_1.NotFoundException('El cliente especificado no existe.');
        }
        if (managerId) {
            const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
            if (!manager) {
                throw new common_1.NotFoundException('El usuario técnico/manager especificado no existe.');
            }
        }
        return this.prisma.project.create({
            data: {
                name,
                description,
                clientId,
                managerId,
                status: status || 'PENDING',
            },
            include: {
                client: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                manager: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async findAll(userRole, userId) {
        if (userRole === 'CLIENT' && userId) {
            const clientUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (clientUser) {
                return this.prisma.project.findMany({
                    where: {
                        client: {
                            email: clientUser.email,
                        },
                    },
                    include: {
                        client: { select: { name: true, email: true } },
                        manager: { select: { firstName: true, lastName: true } },
                    },
                });
            }
        }
        if (userRole === 'TECHNICIAN' && userId) {
            return this.prisma.project.findMany({
                where: { managerId: userId },
                include: {
                    client: { select: { name: true, email: true } },
                    manager: { select: { firstName: true, lastName: true } },
                },
            });
        }
        return this.prisma.project.findMany({
            include: {
                client: { select: { name: true, email: true } },
                manager: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                client: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                        version: true,
                        status: true,
                        total: true,
                        currency: true,
                        isActive: true,
                        createdAt: true,
                    },
                },
                surveyImages: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        return {
            ...project,
            images: project.surveyImages,
        };
    }
    async update(id, updateProjectDto) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        const { clientId, managerId } = updateProjectDto;
        if (clientId) {
            const client = await this.prisma.client.findUnique({ where: { id: clientId } });
            if (!client) {
                throw new common_1.NotFoundException('El cliente especificado no existe.');
            }
        }
        if (managerId) {
            const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
            if (!manager) {
                throw new common_1.NotFoundException('El usuario técnico/manager especificado no existe.');
            }
        }
        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
            include: {
                client: { select: { name: true } },
                manager: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async remove(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        await this.prisma.project.delete({ where: { id } });
        return { success: true, message: 'Proyecto y recursos asociados eliminados correctamente.' };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map