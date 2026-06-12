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
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let ImagesService = class ImagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadProductImage(productId, file) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException('El producto especificado no existe.');
        }
        return this.prisma.image.create({
            data: {
                fileName: file.originalname,
                mimeType: file.mimetype,
                fileData: Buffer.from(file.buffer),
                type: client_1.ImageType.PRODUCT_THUMBNAIL,
                productId,
            },
            select: {
                id: true,
                fileName: true,
                mimeType: true,
                type: true,
                productId: true,
                createdAt: true,
            },
        });
    }
    async uploadProjectSurveyImage(projectId, file) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException('El proyecto especificado no existe.');
        }
        return this.prisma.image.create({
            data: {
                fileName: file.originalname,
                mimeType: file.mimetype,
                fileData: Buffer.from(file.buffer),
                type: client_1.ImageType.PROJECT_SURVEY,
                projectId,
            },
            select: {
                id: true,
                fileName: true,
                mimeType: true,
                type: true,
                projectId: true,
                createdAt: true,
            },
        });
    }
    async findOne(id) {
        const image = await this.prisma.image.findUnique({
            where: { id },
        });
        if (!image) {
            throw new common_1.NotFoundException('La imagen no fue encontrada.');
        }
        return image;
    }
    async remove(id) {
        const image = await this.prisma.image.findUnique({ where: { id } });
        if (!image) {
            throw new common_1.NotFoundException('La imagen no fue encontrada.');
        }
        await this.prisma.image.delete({ where: { id } });
        return { success: true, message: 'Imagen eliminada correctamente.' };
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImagesService);
//# sourceMappingURL=images.service.js.map