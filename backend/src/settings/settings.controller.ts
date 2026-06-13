import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findOne() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @Permissions('settings:write')
  update(@Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.updateSettings(updateSettingDto);
  }

  @Post('logo')
  @Permissions('settings:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.settingsService.uploadLogo(file);
  }
}
