import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ example: 'SecurityNet S.A.', required: false })
  appName?: string;

  @ApiProperty({ example: '+56912345678', required: false })
  phone?: string;

  @ApiProperty({ example: 'contacto@securitynet.cl', required: false })
  email?: string;

  @ApiProperty({ example: 'Av. Providencia 1254, Oficina 402, Santiago, Chile', required: false })
  address?: string;

  @ApiProperty({ example: 'www.securitynet.cl', required: false })
  website?: string;

  @ApiProperty({ example: '#1e3a8a', required: false })
  primaryColor?: string;

  @ApiProperty({ example: '#94a3b8', required: false })
  accentColor?: string;

  @ApiProperty({ example: 'dark', required: false })
  defaultTheme?: string;

  @ApiProperty({ example: 'public-sans', required: false })
  fontStyle?: string;
}
