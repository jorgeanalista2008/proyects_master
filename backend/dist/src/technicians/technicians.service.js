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
exports.TechniciansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let TechniciansService = class TechniciansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTechnicianDto) {
        const { email, password, firstName, lastName, phone, documentNumber, birthDate, academicLevel, profession, trade, address, landmark, shirtSize, pantsSize, shoeSize, weight, height, } = createTechnicianDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado.');
        }
        const existingProfile = await this.prisma.technicianProfile.findUnique({
            where: { documentNumber },
        });
        if (existingProfile) {
            throw new common_1.ConflictException(`El número de documento ${documentNumber} ya está registrado.`);
        }
        const role = await this.prisma.role.findUnique({
            where: { name: 'TECHNICIAN' },
        });
        if (!role) {
            throw new common_1.NotFoundException('El rol de TÉCNICO no está configurado en el sistema.');
        }
        const rawPassword = password || 'TechPassword123!';
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    phone,
                    roleId: role.id,
                },
            });
            const profile = await tx.technicianProfile.create({
                data: {
                    userId: user.id,
                    documentNumber,
                    birthDate: birthDate ? new Date(birthDate) : null,
                    academicLevel,
                    profession,
                    trade,
                    address,
                    landmark,
                    shirtSize,
                    pantsSize,
                    shoeSize,
                    weight: weight ? parseFloat(weight.toString()) : null,
                    height: height ? parseFloat(height.toString()) : null,
                },
            });
            return {
                ...user,
                technicianProfile: profile,
            };
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    name: 'TECHNICIAN',
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                createdAt: true,
                technicianProfile: true,
            },
        });
    }
    async findOne(id) {
        const technician = await this.prisma.user.findFirst({
            where: {
                id,
                role: {
                    name: 'TECHNICIAN',
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isActive: true,
                createdAt: true,
                technicianProfile: true,
            },
        });
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado.');
        }
        return technician;
    }
    async update(id, updateTechnicianDto) {
        const technician = await this.findOne(id);
        const { email, password, firstName, lastName, phone, documentNumber, birthDate, academicLevel, profession, trade, address, landmark, shirtSize, pantsSize, shoeSize, weight, height, } = updateTechnicianDto;
        if (email && email !== technician.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El correo electrónico ya está registrado por otro usuario.');
            }
        }
        if (documentNumber && technician.technicianProfile && documentNumber !== technician.technicianProfile.documentNumber) {
            const existingProfile = await this.prisma.technicianProfile.findUnique({
                where: { documentNumber },
            });
            if (existingProfile) {
                throw new common_1.ConflictException(`El número de documento ${documentNumber} ya está registrado.`);
            }
        }
        let passwordHash;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id },
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    phone,
                },
            });
            const updatedProfile = await tx.technicianProfile.update({
                where: { userId: id },
                data: {
                    documentNumber,
                    birthDate: birthDate ? new Date(birthDate) : undefined,
                    academicLevel,
                    profession,
                    trade,
                    address,
                    landmark,
                    shirtSize,
                    pantsSize,
                    shoeSize,
                    weight: weight !== undefined ? (weight ? parseFloat(weight.toString()) : null) : undefined,
                    height: height !== undefined ? (height ? parseFloat(height.toString()) : null) : undefined,
                },
            });
            return {
                ...updatedUser,
                technicianProfile: updatedProfile,
            };
        });
    }
    async remove(id) {
        const technician = await this.findOne(id);
        if (technician.technicianProfile?.photoId) {
            try {
                await this.prisma.image.delete({
                    where: { id: technician.technicianProfile.photoId },
                });
            }
            catch (err) {
                console.error('Error deleting technician photo during profile removal:', err);
            }
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { deleted: true };
    }
    async uploadPhoto(id, file) {
        const technician = await this.findOne(id);
        if (!technician.technicianProfile) {
            throw new common_1.BadRequestException('El perfil de técnico no existe aún para subir una foto.');
        }
        if (!file) {
            throw new common_1.BadRequestException('Debe proporcionar un archivo de imagen válido.');
        }
        return this.prisma.$transaction(async (tx) => {
            const image = await tx.image.create({
                data: {
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    fileData: Buffer.from(file.buffer),
                    type: client_1.ImageType.TECHNICIAN_PHOTO,
                },
            });
            const oldPhotoId = technician.technicianProfile?.photoId;
            await tx.technicianProfile.update({
                where: { userId: id },
                data: {
                    photoId: image.id,
                },
            });
            if (oldPhotoId) {
                await tx.image.delete({
                    where: { id: oldPhotoId },
                });
            }
            return this.findOne(id);
        });
    }
};
exports.TechniciansService = TechniciansService;
exports.TechniciansService = TechniciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TechniciansService);
//# sourceMappingURL=technicians.service.js.map