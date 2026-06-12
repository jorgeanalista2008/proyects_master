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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCatalogDto) {
        const { sku, name, description, category, unitCost, margin, isActive } = createCatalogDto;
        const existingProduct = await this.prisma.product.findUnique({
            where: { sku },
        });
        if (existingProduct) {
            throw new common_1.ConflictException(`El código SKU ${sku} ya está en uso en el catálogo.`);
        }
        const salePrice = unitCost * (1 + margin / 100);
        return this.prisma.product.create({
            data: {
                sku,
                name,
                description,
                category,
                unitCost,
                margin,
                salePrice,
                isActive: isActive ?? true,
            },
            include: {
                images: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: {
                images: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                images: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('El producto del catálogo no fue encontrado.');
        }
        return product;
    }
    async update(id, updateCatalogDto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('El producto del catálogo no fue encontrado.');
        }
        const { unitCost, margin, ...rest } = updateCatalogDto;
        const updateData = { ...rest };
        const finalUnitCost = unitCost !== undefined ? unitCost : Number(product.unitCost);
        const finalMargin = margin !== undefined ? margin : Number(product.margin);
        if (unitCost !== undefined || margin !== undefined) {
            updateData.unitCost = finalUnitCost;
            updateData.margin = finalMargin;
            updateData.salePrice = finalUnitCost * (1 + finalMargin / 100);
        }
        return this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                images: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('El producto del catálogo no fue encontrado.');
        }
        return this.prisma.product.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, sku: true, isActive: true },
        });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map