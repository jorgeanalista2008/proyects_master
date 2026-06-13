import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnicianDto {
  // User credentials & contact
  @ApiProperty({ example: 'tecnico.instalador@securitynet.com', description: 'Correo electrónico de acceso del técnico' })
  email: string;

  @ApiProperty({ example: 'TechPassword123!', description: 'Contraseña de acceso', required: false })
  password?: string;

  @ApiProperty({ example: 'Marcos', description: 'Nombre' })
  firstName: string;

  @ApiProperty({ example: 'González', description: 'Apellido' })
  lastName: string;

  @ApiProperty({ example: '+56976543210', description: 'Teléfono de contacto', required: false })
  phone?: string;

  // Personal details
  @ApiProperty({ example: '19.876.543-2', description: 'Número de documento fiscal/personal (RUT/DNI)' })
  documentNumber: string;

  @ApiProperty({ example: '1995-08-24', description: 'Fecha de nacimiento (YYYY-MM-DD)', required: false })
  birthDate?: string;

  @ApiProperty({ example: 'Técnico Superior', description: 'Nivel académico', required: false })
  academicLevel?: string;

  @ApiProperty({ example: 'Técnico Electrónico', description: 'Profesión o título', required: false })
  profession?: string;

  @ApiProperty({ example: 'Instalador de Sistemas de Alarma y CCTV', description: 'Oficio o especialidad', required: false })
  trade?: string;

  // Location details
  @ApiProperty({ example: 'Calle Falsa 123, Depto 402', description: 'Dirección particular', required: false })
  address?: string;

  @ApiProperty({ example: 'Frente a la farmacia Cruz Verde', description: 'Punto de referencia del domicilio', required: false })
  landmark?: string;

  // Sizes & Measurements
  @ApiProperty({ example: 'M', description: 'Talla de camisa (XS, S, M, L, XL)', required: false })
  shirtSize?: string;

  @ApiProperty({ example: '38', description: 'Talla de pantalón', required: false })
  pantsSize?: string;

  @ApiProperty({ example: '42', description: 'Talla de calzado (zapatos)', required: false })
  shoeSize?: string;

  @ApiProperty({ example: 78.5, description: 'Peso corporal en Kg', required: false })
  weight?: number;

  @ApiProperty({ example: 1.78, description: 'Estatura/altura en metros', required: false })
  height?: number;
}
