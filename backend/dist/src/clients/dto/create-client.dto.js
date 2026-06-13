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
exports.CreateClientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateClientDto {
    name;
    rutOrId;
    email;
    phone;
    address;
    city;
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Distribuidora del Sur S.A.', description: 'Nombre completo o Razón Social' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '76.843.210-K', description: 'Identificación fiscal (RUT, RFC, DNI)' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "rutOrId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contacto@distsur.cl', description: 'Correo de contacto' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+56987654321', description: 'Teléfono de contacto' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Av. Providencia 1234, Of. 405', description: 'Dirección particular/comercial', required: false }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Santiago', description: 'Ciudad', required: false }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "city", void 0);
//# sourceMappingURL=create-client.dto.js.map