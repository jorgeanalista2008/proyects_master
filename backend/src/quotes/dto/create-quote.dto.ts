import { CurrencyCode } from '@prisma/client';

export class QuoteItemDto {
  productId: string;
  quantity: number;
}

export class CreateQuoteDto {
  projectId: string;
  currency?: CurrencyCode;
  exchangeRate?: number;
  taxRate?: number;
  discount?: number;
  items: QuoteItemDto[];
}
