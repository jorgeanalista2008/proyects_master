import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Soporte Técnico / Equipos')
@ApiBearerAuth('JWT-auth')
@Controller('equipments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  // --- Endpoints de Alertas ---
  @Get('alerts/my-alerts')
  getMyAlerts(@Req() req: any) {
    return this.equipmentsService.getMyAlerts(req.user.sub);
  }

  @Patch('alerts/read-all')
  markAllAlertsAsRead(@Req() req: any) {
    return this.equipmentsService.markAllAlertsAsRead(req.user.sub);
  }

  @Patch('alerts/:alertId/read')
  markAlertAsRead(@Param('alertId') alertId: string, @Req() req: any) {
    return this.equipmentsService.markAlertAsRead(alertId, req.user.sub);
  }

  // --- Endpoints de Equipos ---
  @Post()
  @Permissions('equipments:write')
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  @Permissions('equipments:read')
  findAll(@Req() req: any) {
    return this.equipmentsService.findAll(req.user.role, req.user.sub);
  }

  @Get(':id')
  @Permissions('equipments:read')
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id/status')
  @Permissions('equipments:write', 'equipments:read') // Los técnicos tienen read pero necesitan actualizar sus asignados
  updateStatus(
    @Param('id') id: string,
    @Body() updateEquipmentStatusDto: UpdateEquipmentStatusDto,
    @Req() req: any,
  ) {
    return this.equipmentsService.updateStatus(
      id,
      updateEquipmentStatusDto.status,
      req.user.sub,
      req.user.role,
      updateEquipmentStatusDto.technicalNotes,
    );
  }

  @Patch(':id/assign')
  @Permissions('equipments:write')
  assignTechnician(
    @Param('id') id: string,
    @Body() assignTechnicianDto: AssignTechnicianDto,
  ) {
    return this.equipmentsService.assignTechnician(id, assignTechnicianDto.technicianId);
  }

  @Delete(':id')
  @Permissions('equipments:write')
  remove(@Param('id') id: string) {
    return this.equipmentsService.remove(id);
  }
}
