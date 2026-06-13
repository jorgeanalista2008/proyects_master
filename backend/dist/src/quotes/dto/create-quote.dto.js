"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuoteDto = exports.QuoteItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class QuoteItemDto {
    productId;
    quantity;
}
exports.QuoteItemDto = QuoteItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'p1o2i3u4-y5t6-7r8e-9w0q-e1f2a3b4c5d6', description: 'ID del producto del catálogo' }),
    __metadata("design:type", String)
], QuoteItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, description: 'Cantidad cotizada' }),
    __metadata("design:type", Number)
], QuoteItemDto.prototype, "quantity", void 0);
class CreateQuoteDto {
    projectId;
    currency;
    exchangeRate;
    taxRate;
    discount;
    validUntil;
    items;
}
exports.CreateQuoteDto = CreateQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', description: 'ID único del proyecto asociado' }),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CLP', description: 'Moneda de la cotización', enum: ['USD', 'MXN', 'CLP', 'COP', 'EUR'], required: false, default: 'USD' }),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 920.50, description: 'Tasa de cambio respecto al USD', required: false, default: 1 }),
    __metadata("design:type", Number)
], CreateQuoteDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19, description: 'Porcentaje de impuesto (IVA/VAT)', required: false, default: 19 }),
    __metadata("design:type", Number)
], CreateQuoteDto.prototype, "taxRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.00, description: 'Monto de descuento aplicado sin impuestos', required: false, default: 0 }),
    __metadata("design:type", Number)
], CreateQuoteDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-27T10:00:00.000Z', description: 'Fecha de vencimiento/validez de la cotización', required: false }),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [QuoteItemDto], description: 'Arreglo de ítems del presupuesto' }),
    __metadata("design:type", Array)
], CreateQuoteDto.prototype, "items", void 0);
//# sourceMappingURL=create-quote.dto.js.map