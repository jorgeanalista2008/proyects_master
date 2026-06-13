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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        let config = await this.prisma.systemConfig.findUnique({
            where: { id: 'global' },
        });
        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: {
                    id: 'global',
                    appName: 'SecurityNet S.A.',
                    phone: '+56912345678',
                    email: 'contacto@securitynet.cl',
                    address: 'Av. Providencia 1254, Oficina 402, Santiago, Chile',
                    website: 'www.securitynet.cl',
                    primaryColor: '#7367F0',
                    accentColor: '#82868B',
                    defaultTheme: 'dark',
                },
            });
        }
        return config;
    }
    async updateSettings(dto) {
        await this.getSettings();
        return this.prisma.systemConfig.update({
            where: { id: 'global' },
            data: dto,
        });
    }
    async uploadLogo(file) {
        const config = await this.getSettings();
        if (config.logoId) {
            try {
                await this.prisma.image.delete({ where: { id: config.logoId } });
            }
            catch (e) {
                console.warn('Could not delete old logo image record:', e);
            }
        }
        const newImage = await this.prisma.image.create({
            data: {
                fileName: file.originalname,
                mimeType: file.mimetype,
                fileData: Buffer.from(file.buffer),
                type: client_1.ImageType.COMPANY_LOGO,
            },
        });
        await this.prisma.systemConfig.update({
            where: { id: 'global' },
            data: {
                logoId: newImage.id,
            },
        });
        return {
            logoId: newImage.id,
            fileName: newImage.fileName,
            mimeType: newImage.mimeType,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map