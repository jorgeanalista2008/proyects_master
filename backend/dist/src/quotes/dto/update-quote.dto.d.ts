import { CreateQuoteDto } from './create-quote.dto';
import { QuoteStatus } from '@prisma/client';
declare const UpdateQuoteDto_base: import("@nestjs/common").Type<Partial<CreateQuoteDto>>;
export declare class UpdateQuoteDto extends UpdateQuoteDto_base {
    status?: QuoteStatus;
    isActive?: boolean;
}
export {};
