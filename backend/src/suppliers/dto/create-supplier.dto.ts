import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Syscom Chile', description: 'Nombre o razón social del proveedor' })
  name: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del ejecutivo de contacto', required: false })
  contact?: string;

  @ApiProperty({ example: 'ventas@syscom.cl', description: 'Correo electrónico de contacto', required: false })
  email?: string;

  @ApiProperty({ example: '+56911112222', description: 'Teléfono de contacto', required: false })
  phone?: string;

  @ApiProperty({ example: 'Av. El Condor 123, Huechuraba', description: 'Dirección física del proveedor', required: false })
  address?: string;
}
