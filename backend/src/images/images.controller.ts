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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // Servir la imagen binaria directamente (público para renderizado de HTML)
  @Get(':id')
  async serveImage(@Param('id') id: string, @Res() res: Response) {
    const image = await this.imagesService.findOne(id);
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${image.fileName}"`);
    res.send(image.fileData);
  }

  // Subir imagen para un producto (Requiere catalog:write)
  @Post('product/:productId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('catalog:write')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProductImage(productId, file);
  }

  // Subir imagen para levantamiento de proyecto (Requiere projects:write)
  @Post('project/:projectId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('projects:write')
  @UseInterceptors(FileInterceptor('file'))
  uploadProjectSurveyImage(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProjectSurveyImage(projectId, file);
  }

  // Eliminar una imagen (Requiere projects:write)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('projects:write')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
