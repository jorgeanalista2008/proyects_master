import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: true, description: 'Estado de actividad de la cuenta de usuario', required: false })
  isActive?: boolean;
}
