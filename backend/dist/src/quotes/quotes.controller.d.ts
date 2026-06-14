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
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    label: string;
                };
                sku: string;
                name: string;
            };
        } & {
            id: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            priceType: string;
            productId: string;
            quoteId: string;
        })[];
    } & {
        id: string;
        version: number;
        status: import("@prisma/client").$Enums.QuoteStatus;
        isActive: boolean;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        validUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        createdById: string;
    }>;
    findAll(projectId?: string): Promise<({
        creator: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        version: number;
        status: import("@prisma/client").$Enums.QuoteStatus;
        isActive: boolean;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        validUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        createdById: string;
    })[]>;
    findOne(id: string): Promise<{
        project: {
            client: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                email: string;
                phone: string;
                rutOrId: string;
                address: string | null;
                city: string | null;
            };
            surveyImages: {
                id: string;
                createdAt: Date;
                fileName: string;
                mimeType: string;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ProjectStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
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
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    label: string;
                };
                images: {
                    id: string;
                    fileName: string;
                }[];
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                unitCost: import("@prisma/client-runtime-utils").Decimal;
                sku: string;
                name: string;
                description: string | null;
                categoryId: string;
                marginCash: import("@prisma/client-runtime-utils").Decimal;
                priceCash: import("@prisma/client-runtime-utils").Decimal;
                marginCredit: import("@prisma/client-runtime-utils").Decimal;
                priceCredit: import("@prisma/client-runtime-utils").Decimal;
                marginPreferred: import("@prisma/client-runtime-utils").Decimal;
                pricePreferred: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            priceType: string;
            productId: string;
            quoteId: string;
        })[];
    } & {
        id: string;
        version: number;
        status: import("@prisma/client").$Enums.QuoteStatus;
        isActive: boolean;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        validUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        createdById: string;
    }>;
    update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<{
        items: {
            id: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            margin: import("@prisma/client-runtime-utils").Decimal;
            priceType: string;
            productId: string;
            quoteId: string;
        }[];
    } & {
        id: string;
        version: number;
        status: import("@prisma/client").$Enums.QuoteStatus;
        isActive: boolean;
        currency: import("@prisma/client").$Enums.CurrencyCode;
        exchangeRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        totalCost: import("@prisma/client-runtime-utils").Decimal;
        marginAmount: import("@prisma/client-runtime-utils").Decimal;
        validUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        createdById: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
