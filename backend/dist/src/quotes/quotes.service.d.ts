import { PrismaService } from '../database/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Prisma } from '@prisma/client';
export declare class QuotesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createQuoteDto: CreateQuoteDto, creatorId: string): Promise<{
        items: ({
            product: {
                name: string;
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    label: string;
                };
                sku: string;
            };
        } & {
            id: string;
            unitCost: Prisma.Decimal;
            productId: string;
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            priceType: string;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
            quoteId: string;
        })[];
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
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
                address: string | null;
                rutOrId: string;
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
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ProjectStatus;
            clientId: string;
            managerId: string | null;
        };
        items: ({
            product: {
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
                unitCost: Prisma.Decimal;
                marginCash: Prisma.Decimal;
                priceCash: Prisma.Decimal;
                marginCredit: Prisma.Decimal;
                priceCredit: Prisma.Decimal;
                marginPreferred: Prisma.Decimal;
                pricePreferred: Prisma.Decimal;
            };
        } & {
            id: string;
            unitCost: Prisma.Decimal;
            productId: string;
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            priceType: string;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
            quoteId: string;
        })[];
        creator: {
            id: string;
            email: string;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
        createdById: string;
        validUntil: Date | null;
    }>;
    update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<{
        items: {
            id: string;
            unitCost: Prisma.Decimal;
            productId: string;
            subtotal: Prisma.Decimal;
            quantity: Prisma.Decimal;
            priceType: string;
            unitPrice: Prisma.Decimal;
            margin: Prisma.Decimal;
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
        exchangeRate: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        totalCost: Prisma.Decimal;
        marginAmount: Prisma.Decimal;
        createdById: string;
        validUntil: Date | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
