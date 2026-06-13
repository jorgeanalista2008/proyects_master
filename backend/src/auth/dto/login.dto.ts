import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@securitysystem.com', description: 'Correo electrónico del usuario' })
  email: string;

  @ApiProperty({ example: 'AdminPassword123', description: 'Contraseña de acceso', required: false })
  password?: string;
}
