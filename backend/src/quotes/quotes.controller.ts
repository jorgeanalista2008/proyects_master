import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RoleName } from '@prisma/client';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @GetUser('sub') creatorId: string,
  ) {
    return this.quotesService.create(createQuoteDto, creatorId);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.quotesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SELLER)
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}
