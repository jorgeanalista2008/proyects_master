import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    create(createCatalogDto: CreateCatalogDto): Promise<{
        images: {
            id: string;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sku: string;
        category: import("@prisma/client").$Enums.ItemCategory;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    }>;
    findAll(): Promise<({
        images: {
            id: string;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sku: string;
        category: import("@prisma/client").$Enums.ItemCategory;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        images: {
            id: string;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sku: string;
        category: import("@prisma/client").$Enums.ItemCategory;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(id: string, updateCatalogDto: UpdateCatalogDto): Promise<{
        images: {
            id: string;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sku: string;
        category: import("@prisma/client").$Enums.ItemCategory;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        sku: string;
    }>;
}
