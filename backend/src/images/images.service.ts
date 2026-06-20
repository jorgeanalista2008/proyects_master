import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    try {
      // Verificar si el producto existe
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException('El producto especificado no existe.');
      }

      return await this.prisma.image.create({
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
    } catch (error) {
      this.logToFile('Product', error);
      throw error;
    }
  }

  async uploadProjectSurveyImage(projectId: string, file: Express.Multer.File) {
    try {
      // Verificar si el proyecto existe
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        throw new NotFoundException('El proyecto especificado no existe.');
      }

      return await this.prisma.image.create({
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
    } catch (error) {
      this.logToFile('ProjectSurvey', error);
      throw error;
    }
  }

  async uploadEquipmentImage(equipmentReceiptId: string, file: Express.Multer.File) {
    try {
      // Verificar si el equipo existe
      const equipment = await this.prisma.equipmentReceipt.findUnique({
        where: { id: equipmentReceiptId },
      });
      if (!equipment) {
        throw new NotFoundException('El equipo especificado no existe.');
      }

      return await this.prisma.image.create({
        data: {
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileData: Buffer.from(file.buffer),
          type: ImageType.EQUIPMENT_PHOTO,
          equipmentReceiptId,
        },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          type: true,
          equipmentReceiptId: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.logToFile('Equipment', error);
      throw error;
    }
  }

  private logToFile(context: string, error: any) {
    console.error(`Error uploading image in ${context}:`, error);
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(__dirname, '../../../');
      const logPath = path.join(logDir, 'upload_error.log');
      const message = `${new Date().toISOString()} [${context}] - Error: ${error?.message}\nStack: ${error?.stack}\n\n`;
      fs.appendFileSync(logPath, message, 'utf8');
    } catch (e) {
      console.error('Failed to write image upload log to file:', e);
    }
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
