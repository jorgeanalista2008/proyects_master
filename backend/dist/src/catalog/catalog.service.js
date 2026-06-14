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
        const { sku, name, description, categoryId, unitCost, marginCash, marginCredit, marginPreferred, isActive } = createCatalogDto;
        const existingProduct = await this.prisma.product.findUnique({
            where: { sku },
        });
        if (existingProduct) {
            throw new common_1.ConflictException(`El código SKU ${sku} ya está en uso en el catálogo.`);
        }
        const priceCash = unitCost * (1 + marginCash / 100);
        const priceCredit = unitCost * (1 + marginCredit / 100);
        const pricePreferred = unitCost * (1 + marginPreferred / 100);
        return this.prisma.product.create({
            data: {
                sku,
                name,
                description,
                categoryId,
                unitCost,
                marginCash,
                priceCash,
                marginCredit,
                priceCredit,
                marginPreferred,
                pricePreferred,
                isActive: isActive ?? true,
            },
            include: {
                category: true,
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
                category: true,
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
                category: true,
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
        const { unitCost, marginCash, marginCredit, marginPreferred, ...rest } = updateCatalogDto;
        const updateData = { ...rest };
        const finalUnitCost = unitCost !== undefined ? unitCost : Number(product.unitCost);
        const finalMarginCash = marginCash !== undefined ? marginCash : Number(product.marginCash);
        const finalMarginCredit = marginCredit !== undefined ? marginCredit : Number(product.marginCredit);
        const finalMarginPreferred = marginPreferred !== undefined ? marginPreferred : Number(product.marginPreferred);
        if (unitCost !== undefined ||
            marginCash !== undefined ||
            marginCredit !== undefined ||
            marginPreferred !== undefined) {
            updateData.unitCost = finalUnitCost;
            updateData.marginCash = finalMarginCash;
            updateData.priceCash = finalUnitCost * (1 + finalMarginCash / 100);
            updateData.marginCredit = finalMarginCredit;
            updateData.priceCredit = finalUnitCost * (1 + finalMarginCredit / 100);
            updateData.marginPreferred = finalMarginPreferred;
            updateData.pricePreferred = finalUnitCost * (1 + finalMarginPreferred / 100);
        }
        return this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
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