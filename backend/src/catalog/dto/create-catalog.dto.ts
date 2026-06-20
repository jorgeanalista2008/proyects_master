import { ApiProperty } from '@nestjs/swagger';

export class CreateCatalogDto {
  @ApiProperty({ example: 'CAM-IP-001', description: 'Código único SKU del producto' })
  sku: string;

  @ApiProperty({ example: 'Cámara IP Domo 4MP Hikvision', description: 'Nombre descriptivo del producto' })
  name: string;

  @ApiProperty({ example: 'Cámara IP infrarroja de resolución 4MP con lente motorizado', description: 'Detalle técnico', required: false })
  description?: string;

  @ApiProperty({ example: 'some-uuid-of-category', description: 'ID de la categoría del catálogo' })
  categoryId: string;

  @ApiProperty({ example: 45.50, description: 'Costo unitario de adquisición sin IVA' })
  unitCost: number;

  @ApiProperty({ example: 30.00, description: 'Margen de ganancia al contado (%)' })
  marginCash: number;

  @ApiProperty({ example: 40.00, description: 'Margen de ganancia a crédito (%)' })
  marginCredit: number;

  @ApiProperty({ example: 20.00, description: 'Margen de ganancia preferencial (%)' })
  marginPreferred: number;

  @ApiProperty({ example: true, description: 'Estado del producto en catálogo', required: false, default: true })
  isActive?: boolean;

  @ApiProperty({ example: ['uuid-proveedor'], description: 'IDs de los proveedores que surten el producto', required: false })
  supplierIds?: string[];
}
