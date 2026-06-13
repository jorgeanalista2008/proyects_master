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
exports.UpdateSettingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpdateSettingDto {
    appName;
    phone;
    email;
    address;
    website;
    primaryColor;
    accentColor;
    defaultTheme;
}
exports.UpdateSettingDto = UpdateSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecurityNet S.A.', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "appName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+56912345678', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contacto@securitynet.cl', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Av. Providencia 1254, Oficina 402, Santiago, Chile', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'www.securitynet.cl', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#1e3a8a', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "primaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#94a3b8', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "accentColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'dark', required: false }),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "defaultTheme", void 0);
//# sourceMappingURL=update-setting.dto.js.map