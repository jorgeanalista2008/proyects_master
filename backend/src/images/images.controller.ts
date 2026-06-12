import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // Servir la imagen binaria directamente
  @Get(':id')
  async serveImage(@Param('id') id: string, @Res() res: Response) {
    const image = await this.imagesService.findOne(id);
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${image.fileName}"`);
    res.send(image.fileData);
  }

  // Subir imagen para un producto (Solo ADMIN o SELLER)
  @Post('product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProductImage(productId, file);
  }

  // Subir imagen para levantamiento de proyecto (ADMIN, SELLER o TECHNICIAN)
  @Post('project/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER, RoleName.TECHNICIAN)
  @UseInterceptors(FileInterceptor('file'))
  uploadProjectSurveyImage(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProjectSurveyImage(projectId, file);
  }

  // Eliminar una imagen
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER, RoleName.TECHNICIAN)
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
