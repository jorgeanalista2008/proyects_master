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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    static getAdapter() {
        const isProd = process.env.NODE_ENV === 'production';
        const host = isProd ? 'srv1609.hstgr.io' : (process.env.DB_HOST || 'localhost');
        const port = isProd ? 3306 : parseInt(process.env.DB_PORT || '3306', 10);
        const user = isProd ? 'u646234231_proyects' : (process.env.DB_USER || 'root');
        const password = isProd ? 'Proyects.8826##' : (process.env.DB_PASSWORD || '');
        const database = isProd ? 'u646234231_proyects' : (process.env.DB_NAME || 'projects_master_db');
        return new adapter_mariadb_1.PrismaMariaDb({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 10,
        });
    }
    constructor() {
        super({
            adapter: PrismaService_1.getAdapter(),
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map