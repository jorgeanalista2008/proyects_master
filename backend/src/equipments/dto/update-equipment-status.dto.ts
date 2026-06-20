import { ApiProperty } from '@nestjs/swagger';
import { EquipmentStatus } from '@prisma/client';

export class UpdateEquipmentStatusDto {
  @ApiProperty({ example: 'IN_PROGRESS', enum: ['RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'REPAIRED', 'DELIVERED'] })
  status: EquipmentStatus;

  @ApiProperty({ example: 'Se cambió la pantalla y el conector de carga.', required: false })
  technicalNotes?: string;
}
