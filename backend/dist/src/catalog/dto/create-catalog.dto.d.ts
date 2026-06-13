import { ItemCategory } from '@prisma/client';
export declare class CreateCatalogDto {
    sku: string;
    name: string;
    description?: string;
    category: ItemCategory;
    unitCost: number;
    marginCash: number;
    marginCredit: number;
    marginPreferred: number;
    isActive?: boolean;
}
