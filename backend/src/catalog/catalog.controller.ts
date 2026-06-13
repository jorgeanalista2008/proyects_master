import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('catalog')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @Permissions('catalog:write')
  create(@Body() createCatalogDto: CreateCatalogDto) {
    return this.catalogService.create(createCatalogDto);
  }

  @Get()
  @Permissions('catalog:read')
  findAll() {
    return this.catalogService.findAll();
  }

  @Get(':id')
  @Permissions('catalog:read')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Patch(':id')
  @Permissions('catalog:write')
  update(@Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
    return this.catalogService.update(id, updateCatalogDto);
  }

  @Delete(':id')
  @Permissions('catalog:write')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
