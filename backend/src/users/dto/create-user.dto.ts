import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vendedor@securitysystem.com', description: 'Correo electrónico único' })
  email: string;

  @ApiProperty({ example: 'VendedorPassword123!', description: 'Contraseña de acceso', required: false })
  password?: string;

  @ApiProperty({ example: 'Carlos', description: 'Nombre' })
  firstName: string;

  @ApiProperty({ example: 'López', description: 'Apellido' })
  lastName: string;

  @ApiProperty({ example: '+56912345678', description: 'Teléfono de contacto', required: false })
  phone?: string;

  @ApiProperty({ example: 'SELLER', description: 'Nombre del rol' })
  roleName: string;
}
