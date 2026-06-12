import { PrismaService } from '../database/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        projects: {
            total: number;
            PENDING: number;
            QUOTED: number;
            APPROVED: number;
            IN_PROGRESS: number;
            COMPLETED: number;
            CANCELLED: number;
        };
        quotes: {
            total: number;
            DRAFT: number;
            SENT: number;
            APPROVED: number;
            REJECTED: number;
            EXPIRED: number;
        };
        financialsUSD: {
            revenue: number;
            cost: number;
            profit: number;
            marginPercent: number;
        };
    }>;
    getHistory(): Promise<{
        month: string;
        revenue: number;
        cost: number;
        profit: number;
    }[]>;
}
