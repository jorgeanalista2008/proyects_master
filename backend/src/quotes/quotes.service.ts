import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto, creatorId: string) {
    const { projectId, currency, exchangeRate, taxRate, discount, items, validUntil } = createQuoteDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('La cotización debe contener al menos un ítem.');
    }

    // 1. Validar que el proyecto existe
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('El proyecto especificado no existe.');
    }

    // 2. Determinar la versión autoincremental de cotización para este proyecto
    const quoteCount = await this.prisma.quote.count({
      where: { projectId },
    });
    const version = quoteCount + 1;

    // 3. Procesar ítems y calcular costos
    const processedItems: any[] = [];
    let subtotal = new Prisma.Decimal(0);
    let totalCost = new Prisma.Decimal(0);

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`El producto con ID ${item.productId} no existe en el catálogo.`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`El producto ${product.name} está inactivo y no se puede cotizar.`);
      }

      const quantity = new Prisma.Decimal(item.quantity);
      const unitCost = product.unitCost;
      const priceType = item.priceType || 'CASH';

      let margin = product.marginCash;
      let unitPrice = product.priceCash;
      if (priceType === 'CREDIT') {
        margin = product.marginCredit;
        unitPrice = product.priceCredit;
      } else if (priceType === 'PREFERRED') {
        margin = product.marginPreferred;
        unitPrice = product.pricePreferred;
      }

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
        priceType,
        subtotal: itemSubtotal,
      });
    }

    // 4. Calcular totales
    const disc = new Prisma.Decimal(discount || 0);
    const taxRateDec = new Prisma.Decimal(taxRate ?? 19); // Default 19%
    const taxableAmount = subtotal.sub(disc);
    const taxAmount = taxableAmount.mul(taxRateDec.div(100));
    const total = taxableAmount.add(taxAmount);

    // Rentabilidad
    const marginAmount = taxableAmount.sub(totalCost);

    // 5. Crear cotización en la base de datos (con transacción)
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
          validUntil: validUntil ? new Date(validUntil) : null,
          items: {
            create: processedItems.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
              unitPrice: i.unitPrice,
              margin: i.margin,
              subtotal: i.subtotal,
              priceType: i.priceType,
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

  async findAll(projectId?: string) {
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

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
            surveyImages: {
              select: {
                id: true,
                fileName: true,
                mimeType: true,
                createdAt: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
                images: {
                  select: {
                    id: true,
                    fileName: true,
                  },
                },
              },
            },
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
      throw new NotFoundException('Presupuesto no encontrado.');
    }

    return quote;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quote) {
      throw new NotFoundException('Presupuesto no encontrado.');
    }

    const { status, isActive, currency, exchangeRate, taxRate, discount, items } = updateQuoteDto;

    // Si actualizamos items, volvemos a calcular todo
    if (items && items.length > 0) {
      const processedItems: any[] = [];
      let subtotal = new Prisma.Decimal(0);
      let totalCost = new Prisma.Decimal(0);

      for (const item of items) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new NotFoundException(`El producto con ID ${item.productId} no existe.`);
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const unitCost = product.unitCost;
        const priceType = item.priceType || 'CASH';

        let margin = product.marginCash;
        let unitPrice = product.priceCash;
        if (priceType === 'CREDIT') {
          margin = product.marginCredit;
          unitPrice = product.priceCredit;
        } else if (priceType === 'PREFERRED') {
          margin = product.marginPreferred;
          unitPrice = product.pricePreferred;
        }

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
          priceType,
          subtotal: itemSubtotal,
        });
      }

      const finalDiscount = new Prisma.Decimal(discount !== undefined ? discount : Number(quote.discount));
      const finalTaxRate = new Prisma.Decimal(taxRate !== undefined ? taxRate : Number(quote.taxRate));
      const taxableAmount = subtotal.sub(finalDiscount);
      const taxAmount = taxableAmount.mul(finalTaxRate.div(100));
      const total = taxableAmount.add(taxAmount);
      const marginAmount = taxableAmount.sub(totalCost);

      return this.prisma.$transaction(async (tx) => {
        // Borrar items antiguos
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });

        // Actualizar cotización e insertar nuevos items
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
                priceType: i.priceType,
              })),
            },
          },
          include: { items: true },
        });
      });
    }

    // Si no se actualizan los ítems
    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (currency) dataToUpdate.currency = currency;
    if (exchangeRate !== undefined) dataToUpdate.exchangeRate = exchangeRate;

    if (discount !== undefined || taxRate !== undefined) {
      const finalDiscount = new Prisma.Decimal(discount !== undefined ? discount : Number(quote.discount));
      const finalTaxRate = new Prisma.Decimal(taxRate !== undefined ? taxRate : Number(quote.taxRate));
      const subtotal = new Prisma.Decimal(quote.subtotal);
      const totalCost = new Prisma.Decimal(quote.totalCost);

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
        // Desactivar y rechazar otras del mismo proyecto
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

        // Actualizar el proyecto a APPROVED
        await tx.project.update({
          where: { id: quote.projectId },
          data: { status: 'APPROVED' },
        });
      }

      return updatedQuote;
    });
  }

  async remove(id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Presupuesto no encontrado.');
    }

    await this.prisma.quote.delete({ where: { id } });
    return { success: true, message: 'Presupuesto eliminado correctamente.' };
  }
}
