import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Cliente S.A. o Juan Pérez', description: 'Nombre del cliente que entrega el equipo' })
  clientName: string;

  @ApiProperty({ example: 'uuid-del-cliente', description: 'ID opcional del cliente en la base de datos', required: false })
  clientId?: string;

  @ApiProperty({ example: 'Laptop', description: 'Tipo de equipo' })
  equipmentType: string;

  @ApiProperty({ example: 'Lenovo', description: 'Marca del equipo' })
  brand: string;

  @ApiProperty({ example: 'ThinkPad T14', description: 'Modelo del equipo' })
  model: string;

  @ApiProperty({ example: 'L3N12345678', description: 'Número de serie' })
  serialNumber: string;

  @ApiProperty({ example: 'No enciende, se queda parpadeando el led de carga', description: 'Descripción de la falla' })
  issueDescription: string;

  @ApiProperty({ example: 'uuid-del-tecnico', description: 'ID opcional del técnico asignado inicialmente', required: false })
  technicianId?: string;
}
