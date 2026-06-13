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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let RolesController = class RolesController {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    findMyMenu(req) {
        return this.rolesService.findUserMenu(req.user.sub);
    }
    findAllRoles() {
        return this.rolesService.findAllRoles();
    }
    createRole(dto) {
        return this.rolesService.createRole(dto);
    }
    updateRole(id, dto) {
        return this.rolesService.updateRole(id, dto);
    }
    deleteRole(id) {
        return this.rolesService.deleteRole(id);
    }
    findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }
    findAllMenus() {
        return this.rolesService.findAllMenus();
    }
    createMenu(dto) {
        return this.rolesService.createMenu(dto);
    }
    updateMenu(id, dto) {
        return this.rolesService.updateMenu(id, dto);
    }
    deleteMenu(id) {
        return this.rolesService.deleteMenu(id);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)('my-menu'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findMyMenu", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "createRole", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllPermissions", null);
__decorate([
    (0, common_1.Get)('menus'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllMenus", null);
__decorate([
    (0, common_1.Post)('menus'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Patch)('menus/:id'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updateMenu", null);
__decorate([
    (0, common_1.Delete)('menus/:id'),
    (0, permissions_decorator_1.Permissions)('users:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "deleteMenu", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles y Permisos'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map