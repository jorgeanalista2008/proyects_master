import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async create(createCatalogDto: CreateCatalogDto) {
    const { sku, name, description, categoryId, unitCost, marginCash, marginCredit, marginPreferred, isActive } = createCatalogDto;

    // Verificar si el SKU ya existe
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException(`El código SKU ${sku} ya está en uso en el catálogo.`);
    }

    // Calcular precios de venta
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

  async findOne(id: string) {
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
      throw new NotFoundException('El producto del catálogo no fue encontrado.');
    }

    return product;
  }

  async update(id: string, updateCatalogDto: UpdateCatalogDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('El producto del catálogo no fue encontrado.');
    }

    const { unitCost, marginCash, marginCredit, marginPreferred, ...rest } = updateCatalogDto;
    const updateData: any = { ...rest };

    const finalUnitCost = unitCost !== undefined ? unitCost : Number(product.unitCost);
    const finalMarginCash = marginCash !== undefined ? marginCash : Number(product.marginCash);
    const finalMarginCredit = marginCredit !== undefined ? marginCredit : Number(product.marginCredit);
    const finalMarginPreferred = marginPreferred !== undefined ? marginPreferred : Number(product.marginPreferred);

    if (
      unitCost !== undefined ||
      marginCash !== undefined ||
      marginCredit !== undefined ||
      marginPreferred !== undefined
    ) {
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

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('El producto del catálogo no fue encontrado.');
    }

    // Desactivar el producto en lugar de borrarlo físicamente para preservar cotizaciones históricas
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, sku: true, isActive: true },
    });
  }
}
