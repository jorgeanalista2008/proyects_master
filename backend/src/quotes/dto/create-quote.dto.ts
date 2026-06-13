import { ApiProperty } from '@nestjs/swagger';
import { CurrencyCode } from '@prisma/client';

export class QuoteItemDto {
  @ApiProperty({ example: 'p1o2i3u4-y5t6-7r8e-9w0q-e1f2a3b4c5d6', description: 'ID del producto del catálogo' })
  productId: string;

  @ApiProperty({ example: 4, description: 'Cantidad cotizada' })
  quantity: number;
}

export class CreateQuoteDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', description: 'ID único del proyecto asociado' })
  projectId: string;

  @ApiProperty({ example: 'CLP', description: 'Moneda de la cotización', enum: ['USD', 'MXN', 'CLP', 'COP', 'EUR'], required: false, default: 'USD' })
  currency?: CurrencyCode;

  @ApiProperty({ example: 920.50, description: 'Tasa de cambio respecto al USD', required: false, default: 1 })
  exchangeRate?: number;

  @ApiProperty({ example: 19, description: 'Porcentaje de impuesto (IVA/VAT)', required: false, default: 19 })
  taxRate?: number;

  @ApiProperty({ example: 50.00, description: 'Monto de descuento aplicado sin impuestos', required: false, default: 0 })
  discount?: number;

  @ApiProperty({ example: '2026-06-27T10:00:00.000Z', description: 'Fecha de vencimiento/validez de la cotización', required: false })
  validUntil?: string;

  @ApiProperty({ type: [QuoteItemDto], description: 'Arreglo de ítems del presupuesto' })
  items: QuoteItemDto[];
}
