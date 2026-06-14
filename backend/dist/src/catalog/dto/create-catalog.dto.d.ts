export declare class CreateCatalogDto {
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    unitCost: number;
    marginCash: number;
    marginCredit: number;
    marginPreferred: number;
    isActive?: boolean;
}
