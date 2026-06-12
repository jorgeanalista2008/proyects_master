import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';
import { QuoteStatus } from '@prisma/client';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  status?: QuoteStatus;
  isActive?: boolean;
}
