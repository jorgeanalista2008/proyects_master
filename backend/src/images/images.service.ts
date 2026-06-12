import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    // Verificar si el producto existe
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('El producto especificado no existe.');
    }

    return this.prisma.image.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileData: Buffer.from(file.buffer),
        type: ImageType.PRODUCT_THUMBNAIL,
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

  async uploadProjectSurveyImage(projectId: string, file: Express.Multer.File) {
    // Verificar si el proyecto existe
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('El proyecto especificado no existe.');
    }

    return this.prisma.image.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileData: Buffer.from(file.buffer),
        type: ImageType.PROJECT_SURVEY,
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

  async findOne(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('La imagen no fue encontrada.');
    }

    return image;
  }

  async remove(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException('La imagen no fue encontrada.');
    }

    await this.prisma.image.delete({ where: { id } });
    return { success: true, message: 'Imagen eliminada correctamente.' };
  }
}
