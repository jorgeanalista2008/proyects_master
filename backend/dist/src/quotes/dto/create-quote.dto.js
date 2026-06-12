"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuoteDto = exports.QuoteItemDto = void 0;
class QuoteItemDto {
    productId;
    quantity;
}
exports.QuoteItemDto = QuoteItemDto;
class CreateQuoteDto {
    projectId;
    currency;
    exchangeRate;
    taxRate;
    discount;
    items;
}
exports.CreateQuoteDto = CreateQuoteDto;
//# sourceMappingURL=create-quote.dto.js.map