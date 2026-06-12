import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(createQuoteDto: CreateQuoteDto, creatorId: string): Promise<{
        creator: {
            firstName: string;
            lastName: string;
        };
        items: ({
            product: {
                name: string;
                sku: string;
                category: import("@prisma/client").$Enums.ItemCategory;
            };
        } & {
            id: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            quoteId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        projectId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        version: number;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        createdById: string;
        validUntil: Date | null;
    }>;
    findAll(projectId?: string): Promise<({
        creator: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        projectId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        version: number;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        createdById: string;
        validUntil: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        project: {
            client: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phone: string;
                rutOrId: string;
                address: string | null;
                city: string | null;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ProjectStatus;
            clientId: string;
            managerId: string | null;
        };
        creator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sku: string;
                category: import("@prisma/client").$Enums.ItemCategory;
                unitCost: import("@prisma/client-runtime-utils").Decimal;
                margin: import("@prisma/client-runtime-utils").Decimal;
                salePrice: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            quoteId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        projectId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        version: number;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        createdById: string;
        validUntil: Date | null;
    }>;
    update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<{
        items: {
            id: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            quoteId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        projectId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        version: number;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        createdById: string;
        validUntil: Date | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
