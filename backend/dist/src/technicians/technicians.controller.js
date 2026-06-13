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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechniciansController = void 0;
const common_1 = require("@nestjs/common");
const technicians_service_1 = require("./technicians.service");
const create_technician_dto_1 = require("./dto/create-technician.dto");
const update_technician_dto_1 = require("./dto/update-technician.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
let TechniciansController = class TechniciansController {
    techniciansService;
    constructor(techniciansService) {
        this.techniciansService = techniciansService;
    }
    create(createTechnicianDto) {
        return this.techniciansService.create(createTechnicianDto);
    }
    findAll() {
        return this.techniciansService.findAll();
    }
    findOne(id, reqUserId, reqUserRole) {
        if (reqUserRole !== client_1.RoleName.ADMIN && reqUserRole !== client_1.RoleName.SELLER && reqUserId !== id) {
            throw new common_1.ForbiddenException('No tiene permisos para ver este perfil.');
        }
        return this.techniciansService.findOne(id);
    }
    update(id, updateTechnicianDto, reqUserId, reqUserRole) {
        if (reqUserRole !== client_1.RoleName.ADMIN && reqUserRole !== client_1.RoleName.SELLER && reqUserId !== id) {
            throw new common_1.ForbiddenException('No tiene permisos para modificar este perfil.');
        }
        return this.techniciansService.update(id, updateTechnicianDto);
    }
    remove(id) {
        return this.techniciansService.remove(id);
    }
    uploadPhoto(id, file, reqUserId, reqUserRole) {
        if (reqUserRole !== client_1.RoleName.ADMIN && reqUserRole !== client_1.RoleName.SELLER && reqUserId !== id) {
            throw new common_1.ForbiddenException('No tiene permisos para cambiar la foto de este perfil.');
        }
        return this.techniciansService.uploadPhoto(id, file);
    }
};
exports.TechniciansController = TechniciansController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.SELLER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_technician_dto_1.CreateTechnicianDto]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.SELLER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __param(2, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __param(3, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_technician_dto_1.UpdateTechnicianDto, String, String]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.SELLER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __param(3, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "uploadPhoto", null);
exports.TechniciansController = TechniciansController = __decorate([
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('technicians'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [technicians_service_1.TechniciansService])
], TechniciansController);
//# sourceMappingURL=technicians.controller.js.map