import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async create(createCatalogDto: CreateCatalogDto) {
    const { sku, name, description, category, unitCost, margin, isActive } = createCatalogDto;

    // Verificar si el SKU ya existe
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException(`El código SKU ${sku} ya está en uso en el catálogo.`);
    }

    // Calcular precio de venta
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

  async findOne(id: string) {
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
      throw new NotFoundException('El producto del catálogo no fue encontrado.');
    }

    return product;
  }

  async update(id: string, updateCatalogDto: UpdateCatalogDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('El producto del catálogo no fue encontrado.');
    }

    const { unitCost, margin, ...rest } = updateCatalogDto;
    const updateData: any = { ...rest };

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
