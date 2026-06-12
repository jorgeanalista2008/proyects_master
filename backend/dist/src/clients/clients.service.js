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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClientDto) {
        const { rutOrId, name, email, phone, address, city } = createClientDto;
        const existingClient = await this.prisma.client.findUnique({
            where: { rutOrId },
        });
        if (existingClient) {
            throw new common_1.ConflictException(`El cliente con identificación fiscal ${rutOrId} ya existe.`);
        }
        return this.prisma.client.create({
            data: {
                name,
                rutOrId,
                email,
                phone,
                address,
                city,
            },
        });
    }
    async findAll() {
        return this.prisma.client.findMany({
            include: {
                _count: {
                    select: { projects: true },
                },
            },
        });
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                projects: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado.');
        }
        return client;
    }
    async update(id, updateClientDto) {
        const client = await this.prisma.client.findUnique({ where: { id } });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado.');
        }
        const { rutOrId } = updateClientDto;
        if (rutOrId && rutOrId !== client.rutOrId) {
            const existingClient = await this.prisma.client.findUnique({ where: { rutOrId } });
            if (existingClient) {
                throw new common_1.ConflictException(`La identificación fiscal ${rutOrId} ya está registrada por otro cliente.`);
            }
        }
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async remove(id) {
        const client = await this.prisma.client.findUnique({ where: { id } });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado.');
        }
        const projectCount = await this.prisma.project.count({
            where: { clientId: id },
        });
        if (projectCount > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el cliente porque tiene ${projectCount} proyecto(s) asociado(s).`);
        }
        await this.prisma.client.delete({ where: { id } });
        return { success: true, message: 'Cliente eliminado correctamente.' };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map