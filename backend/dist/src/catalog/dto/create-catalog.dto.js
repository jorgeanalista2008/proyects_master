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
exports.CreateCatalogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateCatalogDto {
    sku;
    name;
    description;
    category;
    unitCost;
    margin;
    isActive;
}
exports.CreateCatalogDto = CreateCatalogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CAM-IP-001', description: 'Código único SKU del producto' }),
    __metadata("design:type", String)
], CreateCatalogDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cámara IP Domo 4MP Hikvision', description: 'Nombre descriptivo del producto' }),
    __metadata("design:type", String)
], CreateCatalogDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cámara IP infrarroja de resolución 4MP con lente motorizado', description: 'Detalle técnico', required: false }),
    __metadata("design:type", String)
], CreateCatalogDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CAMERA', description: 'Categoría del catálogo', enum: ['CAMERA', 'DVR_NVR', 'CABLE', 'TUBING', 'ACCESSORY', 'LABOR', 'SERVICE'] }),
    __metadata("design:type", String)
], CreateCatalogDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45.50, description: 'Costo unitario de adquisición sin IVA' }),
    __metadata("design:type", Number)
], CreateCatalogDto.prototype, "unitCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35.00, description: 'Margen de ganancia en porcentaje (%)' }),
    __metadata("design:type", Number)
], CreateCatalogDto.prototype, "margin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Estado del producto en catálogo', required: false, default: true }),
    __metadata("design:type", Boolean)
], CreateCatalogDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-catalog.dto.js.map