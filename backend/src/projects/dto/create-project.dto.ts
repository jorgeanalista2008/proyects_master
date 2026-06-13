import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Instalación CCTV Bodega Central', description: 'Nombre del proyecto' })
  name: string;

  @ApiProperty({ example: 'Implementación de 16 cámaras IP, cableado estructurado y grabador de 32 canales.', description: 'Alcance técnico', required: false })
  description?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', description: 'ID único del cliente asociado' })
  clientId: string;

  @ApiProperty({ example: 'f1e2d3c4-b5a6-7988-976d-123456789abc', description: 'ID único del técnico a cargo (Manager)', required: false })
  managerId?: string;

  @ApiProperty({ example: 'PENDING', description: 'Estado inicial del proyecto', enum: ['PENDING', 'QUOTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], required: false, default: 'PENDING' })
  status?: ProjectStatus;
}
