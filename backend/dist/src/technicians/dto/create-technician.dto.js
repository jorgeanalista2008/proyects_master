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
exports.CreateTechnicianDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateTechnicianDto {
    email;
    password;
    firstName;
    lastName;
    phone;
    documentNumber;
    birthDate;
    academicLevel;
    profession;
    trade;
    address;
    landmark;
    shirtSize;
    pantsSize;
    shoeSize;
    weight;
    height;
}
exports.CreateTechnicianDto = CreateTechnicianDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tecnico.instalador@securitynet.com', description: 'Correo electrónico de acceso del técnico' }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TechPassword123!', description: 'Contraseña de acceso', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Marcos', description: 'Nombre' }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'González', description: 'Apellido' }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+56976543210', description: 'Teléfono de contacto', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '19.876.543-2', description: 'Número de documento fiscal/personal (RUT/DNI)' }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1995-08-24', description: 'Fecha de nacimiento (YYYY-MM-DD)', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Técnico Superior', description: 'Nivel académico', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "academicLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Técnico Electrónico', description: 'Profesión o título', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "profession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Instalador de Sistemas de Alarma y CCTV', description: 'Oficio o especialidad', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "trade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Calle Falsa 123, Depto 402', description: 'Dirección particular', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Frente a la farmacia Cruz Verde', description: 'Punto de referencia del domicilio', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'M', description: 'Talla de camisa (XS, S, M, L, XL)', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "shirtSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '38', description: 'Talla de pantalón', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "pantsSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '42', description: 'Talla de calzado (zapatos)', required: false }),
    __metadata("design:type", String)
], CreateTechnicianDto.prototype, "shoeSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 78.5, description: 'Peso corporal en Kg', required: false }),
    __metadata("design:type", Number)
], CreateTechnicianDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.78, description: 'Estatura/altura en metros', required: false }),
    __metadata("design:type", Number)
], CreateTechnicianDto.prototype, "height", void 0);
//# sourceMappingURL=create-technician.dto.js.map