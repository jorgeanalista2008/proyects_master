import { CurrencyCode } from '@prisma/client';
export declare class QuoteItemDto {
    productId: string;
    quantity: number;
    priceType?: string;
}
export declare class CreateQuoteDto {
    projectId: string;
    currency?: CurrencyCode;
    exchangeRate?: number;
    taxRate?: number;
    discount?: number;
    validUntil?: string;
    items: QuoteItemDto[];
}
