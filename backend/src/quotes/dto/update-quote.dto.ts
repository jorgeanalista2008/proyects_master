import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateQuoteDto } from './create-quote.dto';
import { QuoteStatus } from '@prisma/client';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @ApiProperty({ example: 'APPROVED', description: 'Estado del presupuesto', enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'], required: false })
  status?: QuoteStatus;

  @ApiProperty({ example: true, description: 'Define si la cotización está activa para el proyecto', required: false })
  isActive?: boolean;
}
