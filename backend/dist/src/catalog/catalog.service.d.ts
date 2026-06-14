import { PrismaService } from '../database/prisma.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
export declare class CatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCatalogDto: CreateCatalogDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
        };
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
        categoryId: string;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    }>;
    findAll(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
        };
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
        categoryId: string;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
        };
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
        categoryId: string;
        unitCost: import("@prisma/client-runtime-utils").Decimal;
        marginCash: import("@prisma/client-runtime-utils").Decimal;
        priceCash: import("@prisma/client-runtime-utils").Decimal;
        marginCredit: import("@prisma/client-runtime-utils").Decimal;
        priceCredit: import("@prisma/client-runtime-utils").Decimal;
        marginPreferred: import("@prisma/client-runtime-utils").Decimal;
        pricePreferred: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(id: string, updateCatalogDto: UpdateCatalogDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
        };
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
        categoryId: string;
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
