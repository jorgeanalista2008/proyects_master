"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const projectStats = await this.prisma.project.groupBy({
            by: ['status'],
            _count: {
                _all: true,
            },
        });
        const projectsSummary = {
            total: 0,
            PENDING: 0,
            QUOTED: 0,
            APPROVED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };
        projectStats.forEach((stat) => {
            projectsSummary[stat.status] = stat._count._all;
            projectsSummary.total += stat._count._all;
        });
        const quoteStats = await this.prisma.quote.groupBy({
            by: ['status'],
            _count: {
                _all: true,
            },
        });
        const quotesSummary = {
            total: 0,
            DRAFT: 0,
            SENT: 0,
            APPROVED: 0,
            REJECTED: 0,
            EXPIRED: 0,
        };
        quoteStats.forEach((stat) => {
            quotesSummary[stat.status] = stat._count._all;
            quotesSummary.total += stat._count._all;
        });
        const approvedQuotes = await this.prisma.quote.findMany({
            where: { status: client_1.QuoteStatus.APPROVED },
            select: {
                total: true,
                totalCost: true,
                taxAmount: true,
                exchangeRate: true,
            },
        });
        let totalRevenueUSD = 0;
        let totalCostUSD = 0;
        let totalProfitUSD = 0;
        approvedQuotes.forEach((quote) => {
            const rate = Number(quote.exchangeRate) || 1;
            const revenueLocal = Number(quote.total) - Number(quote.taxAmount);
            const revenueUSD = revenueLocal / rate;
            const costUSD = Number(quote.totalCost) / rate;
            totalRevenueUSD += revenueUSD;
            totalCostUSD += costUSD;
            totalProfitUSD += (revenueUSD - costUSD);
        });
        const marginPercentage = totalRevenueUSD > 0
            ? (totalProfitUSD / totalRevenueUSD) * 100
            : 0;
        return {
            projects: projectsSummary,
            quotes: quotesSummary,
            financialsUSD: {
                revenue: Math.round(totalRevenueUSD * 100) / 100,
                cost: Math.round(totalCostUSD * 100) / 100,
                profit: Math.round(totalProfitUSD * 100) / 100,
                marginPercent: Math.round(marginPercentage * 100) / 100,
            },
        };
    }
    async getHistory() {
        const approvedQuotes = await this.prisma.quote.findMany({
            where: {
                status: client_1.QuoteStatus.APPROVED,
            },
            select: {
                total: true,
                totalCost: true,
                taxAmount: true,
                exchangeRate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const monthlyData = {};
        approvedQuotes.forEach((quote) => {
            const date = new Date(quote.createdAt);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const rate = Number(quote.exchangeRate) || 1;
            const revenueUSD = (Number(quote.total) - Number(quote.taxAmount)) / rate;
            const costUSD = Number(quote.totalCost) / rate;
            const profitUSD = revenueUSD - costUSD;
            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    month: yearMonth,
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                };
            }
            monthlyData[yearMonth].revenue += revenueUSD;
            monthlyData[yearMonth].cost += costUSD;
            monthlyData[yearMonth].profit += profitUSD;
        });
        const result = Object.values(monthlyData).map(data => ({
            month: data.month,
            revenue: Math.round(data.revenue * 100) / 100,
            cost: Math.round(data.cost * 100) / 100,
            profit: Math.round(data.profit * 100) / 100,
        }));
        return result;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map