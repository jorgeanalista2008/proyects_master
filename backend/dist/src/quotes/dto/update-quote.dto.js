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
exports.UpdateQuoteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_quote_dto_1 = require("./create-quote.dto");
const client_1 = require("@prisma/client");
class UpdateQuoteDto extends (0, swagger_1.PartialType)(create_quote_dto_1.CreateQuoteDto) {
    status;
    isActive;
}
exports.UpdateQuoteDto = UpdateQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'APPROVED', description: 'Estado del presupuesto', enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'], required: false }),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Define si la cotización está activa para el proyecto', required: false }),
    __metadata("design:type", Boolean)
], UpdateQuoteDto.prototype, "isActive", void 0);
//# sourceMappingURL=update-quote.dto.js.map