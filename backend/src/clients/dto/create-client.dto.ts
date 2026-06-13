import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Distribuidora del Sur S.A.', description: 'Nombre completo o Razón Social' })
  name: string;

  @ApiProperty({ example: '76.843.210-K', description: 'Identificación fiscal (RUT, RFC, DNI)' })
  rutOrId: string;

  @ApiProperty({ example: 'contacto@distsur.cl', description: 'Correo de contacto' })
  email: string;

  @ApiProperty({ example: '+56987654321', description: 'Teléfono de contacto' })
  phone: string;

  @ApiProperty({ example: 'Av. Providencia 1234, Of. 405', description: 'Dirección particular/comercial', required: false })
  address?: string;

  @ApiProperty({ example: 'Santiago', description: 'Ciudad', required: false })
  city?: string;
}
