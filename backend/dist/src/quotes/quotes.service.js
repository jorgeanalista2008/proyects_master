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
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let QuotesService = class QuotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuoteDto, creatorId) {
        const { projectId, currency, exchangeRate, taxRate, discount, items } = createQuoteDto;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('La cotización debe contener al menos un ítem.');
        }
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException('El proyecto especificado no existe.');
        }
        const quoteCount = await this.prisma.quote.count({
            where: { projectId },
        });
        const version = quoteCount + 1;
        const processedItems = [];
        let subtotal = new client_1.Prisma.Decimal(0);
        let totalCost = new client_1.Prisma.Decimal(0);
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`El producto con ID ${item.productId} no existe en el catálogo.`);
            }
            if (!product.isActive) {
                throw new common_1.BadRequestException(`El producto ${product.name} está inactivo y no se puede cotizar.`);
            }
            const quantity = new client_1.Prisma.Decimal(item.quantity);
            const unitCost = product.unitCost;
            const margin = product.margin;
            const unitPrice = product.salePrice;
            const itemSubtotal = quantity.mul(unitPrice);
            const itemCost = quantity.mul(unitCost);
            subtotal = subtotal.add(itemSubtotal);
            totalCost = totalCost.add(itemCost);
            processedItems.push({
                productId: product.id,
                quantity,
                unitCost,
                unitPrice,
                margin,
                subtotal: itemSubtotal,
            });
        }
        const disc = new client_1.Prisma.Decimal(discount || 0);
        const taxRateDec = new client_1.Prisma.Decimal(taxRate ?? 19);
        const taxableAmount = subtotal.sub(disc);
        const taxAmount = taxableAmount.mul(taxRateDec.div(100));
        const total = taxableAmount.add(taxAmount);
        const marginAmount = taxableAmount.sub(totalCost);
        return this.prisma.$transaction(async (tx) => {
            const newQuote = await tx.quote.create({
                data: {
                    projectId,
                    version,
                    status: 'DRAFT',
                    isActive: true,
                    currency: currency || 'USD',
                    exchangeRate: exchangeRate || 1.0000,
                    subtotal,
                    taxRate: taxRateDec,
                    taxAmount,
                    discount: disc,
                    total,
                    totalCost,
                    marginAmount,
                    createdById: creatorId,
                    items: {
                        create: processedItems.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitCost: i.unitCost,
                            unitPrice: i.unitPrice,
                            margin: i.margin,
                            subtotal: i.subtotal,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    sku: true,
                                    name: true,
                                    category: true,
                                },
                            },
                        },
                    },
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            return newQuote;
        });
    }
    async findAll(projectId) {
        if (projectId) {
            return this.prisma.quote.findMany({
                where: { projectId },
                orderBy: { version: 'desc' },
                include: {
                    creator: { select: { firstName: true, lastName: true } },
                },
            });
        }
        return this.prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { name: true } },
                creator: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async findOne(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!quote) {
            throw new common_1.NotFoundException('Presupuesto no encontrado.');
        }
        return quote;
    }
    async update(id, updateQuoteDto) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!quote) {
            throw new common_1.NotFoundException('Presupuesto no encontrado.');
        }
        const { status, isActive, currency, exchangeRate, taxRate, discount, items } = updateQuoteDto;
        if (items && items.length > 0) {
            const processedItems = [];
            let subtotal = new client_1.Prisma.Decimal(0);
            let totalCost = new client_1.Prisma.Decimal(0);
            for (const item of items) {
                const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
                if (!product) {
                    throw new common_1.NotFoundException(`El producto con ID ${item.productId} no existe.`);
                }
                const quantity = new client_1.Prisma.Decimal(item.quantity);
                const unitCost = product.unitCost;
                const margin = product.margin;
                const unitPrice = product.salePrice;
                const itemSubtotal = quantity.mul(unitPrice);
                const itemCost = quantity.mul(unitCost);
                subtotal = subtotal.add(itemSubtotal);
                totalCost = totalCost.add(itemCost);
                processedItems.push({
                    productId: product.id,
                    quantity,
                    unitCost,
                    unitPrice,
                    margin,
                    subtotal: itemSubtotal,
                });
            }
            const finalDiscount = new client_1.Prisma.Decimal(discount !== undefined ? discount : Number(quote.discount));
            const finalTaxRate = new client_1.Prisma.Decimal(taxRate !== undefined ? taxRate : Number(quote.taxRate));
            const taxableAmount = subtotal.sub(finalDiscount);
            const taxAmount = taxableAmount.mul(finalTaxRate.div(100));
            const total = taxableAmount.add(taxAmount);
            const marginAmount = taxableAmount.sub(totalCost);
            return this.prisma.$transaction(async (tx) => {
                await tx.quoteItem.deleteMany({ where: { quoteId: id } });
                return tx.quote.update({
                    where: { id },
                    data: {
                        status: status || quote.status,
                        isActive: isActive !== undefined ? isActive : quote.isActive,
                        currency: currency || quote.currency,
                        exchangeRate: exchangeRate || quote.exchangeRate,
                        subtotal,
                        taxRate: finalTaxRate,
                        taxAmount,
                        discount: finalDiscount,
                        total,
                        totalCost,
                        marginAmount,
                        items: {
                            create: processedItems.map(i => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                unitCost: i.unitCost,
                                unitPrice: i.unitPrice,
                                margin: i.margin,
                                subtotal: i.subtotal,
                            })),
                        },
                    },
                    include: { items: true },
                });
            });
        }
        const dataToUpdate = {};
        if (status)
            dataToUpdate.status = status;
        if (isActive !== undefined)
            dataToUpdate.isActive = isActive;
        if (currency)
            dataToUpdate.currency = currency;
        if (exchangeRate !== undefined)
            dataToUpdate.exchangeRate = exchangeRate;
        if (discount !== undefined || taxRate !== undefined) {
            const finalDiscount = new client_1.Prisma.Decimal(discount !== undefined ? discount : Number(quote.discount));
            const finalTaxRate = new client_1.Prisma.Decimal(taxRate !== undefined ? taxRate : Number(quote.taxRate));
            const subtotal = new client_1.Prisma.Decimal(quote.subtotal);
            const totalCost = new client_1.Prisma.Decimal(quote.totalCost);
            const taxableAmount = subtotal.sub(finalDiscount);
            const taxAmount = taxableAmount.mul(finalTaxRate.div(100));
            const total = taxableAmount.add(taxAmount);
            const marginAmount = taxableAmount.sub(totalCost);
            dataToUpdate.discount = finalDiscount;
            dataToUpdate.taxRate = finalTaxRate;
            dataToUpdate.taxAmount = taxAmount;
            dataToUpdate.total = total;
            dataToUpdate.marginAmount = marginAmount;
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedQuote = await tx.quote.update({
                where: { id },
                data: dataToUpdate,
                include: { items: true },
            });
            if (status === 'APPROVED') {
                await tx.quote.updateMany({
                    where: {
                        projectId: quote.projectId,
                        id: { not: id },
                    },
                    data: {
                        isActive: false,
                        status: 'REJECTED',
                    },
                });
                await tx.project.update({
                    where: { id: quote.projectId },
                    data: { status: 'APPROVED' },
                });
            }
            return updatedQuote;
        });
    }
    async remove(id) {
        const quote = await this.prisma.quote.findUnique({ where: { id } });
        if (!quote) {
            throw new common_1.NotFoundException('Presupuesto no encontrado.');
        }
        await this.prisma.quote.delete({ where: { id } });
        return { success: true, message: 'Presupuesto eliminado correctamente.' };
    }
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map