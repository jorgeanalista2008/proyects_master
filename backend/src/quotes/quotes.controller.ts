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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('quotes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @Permissions('quotes:write')
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @GetUser('sub') creatorId: string,
  ) {
    return this.quotesService.create(createQuoteDto, creatorId);
  }

  @Get()
  @Permissions('quotes:read')
  findAll(@Query('projectId') projectId?: string) {
    return this.quotesService.findAll(projectId);
  }

  @Get(':id')
  @Permissions('quotes:read')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('quotes:write')
  update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @Permissions('quotes:write')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}
