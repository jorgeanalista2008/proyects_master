import { PrismaService } from '../database/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Prisma } from '@prisma/client';
export declare class QuotesService {
    private prisma;
    constructor(prisma: PrismaService);
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
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            unitCost: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
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
                unitCost: Prisma.Decimal;
                sku: string;
                name: string;
                description: string | null;
                categoryId: string;
                marginCash: Prisma.Decimal;
                priceCash: Prisma.Decimal;
                marginCredit: Prisma.Decimal;
                priceCredit: Prisma.Decimal;
                marginPreferred: Prisma.Decimal;
                pricePreferred: Prisma.Decimal;
            };
        } & {
            id: string;
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            unitCost: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
        validUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        createdById: string;
    }>;
    update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<{
        items: {
            id: string;
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            unitCost: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
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
