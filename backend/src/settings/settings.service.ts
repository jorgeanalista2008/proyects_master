import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ImageType } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let config = await this.prisma.systemConfig.findUnique({
      where: { id: 'global' },
    });

    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          id: 'global',
          appName: 'SecurityNet S.A.',
          phone: '+56912345678',
          email: 'contacto@securitynet.cl',
          address: 'Av. Providencia 1254, Oficina 402, Santiago, Chile',
          website: 'www.securitynet.cl',
          primaryColor: '#7367F0',
          accentColor: '#82868B',
          defaultTheme: 'dark',
        },
      });
    }

    return config;
  }

  async updateSettings(dto: UpdateSettingDto) {
    // Ensure config exists
    await this.getSettings();

    return this.prisma.systemConfig.update({
      where: { id: 'global' },
      data: dto,
    });
  }

  async uploadLogo(file: Express.Multer.File) {
    // Ensure config exists
    const config = await this.getSettings();

    // Delete old logo from DB if exists
    if (config.logoId) {
      try {
        await this.prisma.image.delete({ where: { id: config.logoId } });
      } catch (e) {
        console.warn('Could not delete old logo image record:', e);
      }
    }

    // Save new logo image
    const newImage = await this.prisma.image.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileData: Buffer.from(file.buffer),
        type: ImageType.COMPANY_LOGO,
      },
    });

    // Update settings logoId
    await this.prisma.systemConfig.update({
      where: { id: 'global' },
      data: {
        logoId: newImage.id,
      },
    });

    return {
      logoId: newImage.id,
      fileName: newImage.fileName,
      mimeType: newImage.mimeType,
    };
  }
}
