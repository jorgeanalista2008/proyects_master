"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { email, password, firstName, lastName, phone, roleName } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado.');
        }
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new common_1.NotFoundException(`El rol ${roleName} no fue encontrado.`);
        }
        const rawPassword = password || 'UserPassword123!';
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        return this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                phone,
                roleId: role.id,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                role: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                createdAt: true,
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        return user;
    }
    async findOneByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        const { password, roleName, ...rest } = updateUserDto;
        const updateData = { ...rest };
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }
        if (roleName) {
            const role = await this.prisma.role.findUnique({ where: { name: roleName } });
            if (!role) {
                throw new common_1.NotFoundException(`El rol ${roleName} no fue encontrado.`);
            }
            updateData.roleId = role.id;
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, email: true, isActive: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map