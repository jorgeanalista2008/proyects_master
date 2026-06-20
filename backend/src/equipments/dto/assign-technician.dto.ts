import { ApiProperty } from '@nestjs/swagger';

export class AssignTechnicianDto {
  @ApiProperty({ example: 'uuid-del-tecnico', description: 'ID del técnico asignado' })
  technicianId: string;
}
