// d:\github\proyects_master\backend\src\technicians\technicians.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import * as bcrypt from 'bcrypt';
import { ImageType } from '@prisma/client';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async create(createTechnicianDto: CreateTechnicianDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      documentNumber,
      birthDate,
      academicLevel,
      profession,
      trade,
      address,
      landmark,
      shirtSize,
      pantsSize,
      shoeSize,
      weight,
      height,
    } = createTechnicianDto;

    // 1. Validaciones previas
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const existingProfile = await this.prisma.technicianProfile.findUnique({
      where: { documentNumber },
    });
    if (existingProfile) {
      throw new ConflictException(`El número de documento ${documentNumber} ya está registrado.`);
    }

    // Buscar rol TECHNICIAN
    const role = await this.prisma.role.findUnique({
      where: { name: 'TECHNICIAN' },
    });
    if (!role) {
      throw new NotFoundException('El rol de TÉCNICO no está configurado en el sistema.');
    }

    // Contraseña por defecto si no se ingresa una
    const rawPassword = password || 'TechPassword123!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 2. Transacción de creación
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

  async findOne(id: string) {
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
      throw new NotFoundException('Técnico no encontrado.');
    }

    return technician;
  }

  async update(id: string, updateTechnicianDto: UpdateTechnicianDto) {
    const technician = await this.findOne(id);

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      documentNumber,
      birthDate,
      academicLevel,
      profession,
      trade,
      address,
      landmark,
      shirtSize,
      pantsSize,
      shoeSize,
      weight,
      height,
    } = updateTechnicianDto;

    // Validar email si cambia
    if (email && email !== technician.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado por otro usuario.');
      }
    }

    // Validar documentNumber si cambia
    if (documentNumber && technician.technicianProfile && documentNumber !== technician.technicianProfile.documentNumber) {
      const existingProfile = await this.prisma.technicianProfile.findUnique({
        where: { documentNumber },
      });
      if (existingProfile) {
        throw new ConflictException(`El número de documento ${documentNumber} ya está registrado.`);
      }
    }

    // Encriptar nueva contraseña si se provee
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar User
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

      // Actualizar Perfil
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

  async remove(id: string) {
    const technician = await this.findOne(id);
    
    // Si tiene una foto asociada, eliminarla
    if (technician.technicianProfile?.photoId) {
      try {
        await this.prisma.image.delete({
          where: { id: technician.technicianProfile.photoId },
        });
      } catch (err) {
        console.error('Error deleting technician photo during profile removal:', err);
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async uploadPhoto(id: string, file: Express.Multer.File) {
    const technician = await this.findOne(id);
    if (!technician.technicianProfile) {
      throw new BadRequestException('El perfil de técnico no existe aún para subir una foto.');
    }

    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo de imagen válido.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear registro de imagen
      const image = await tx.image.create({
        data: {
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileData: Buffer.from(file.buffer),
          type: ImageType.TECHNICIAN_PHOTO,
        },
      });

      // 2. Guardar el photoId viejo
      const oldPhotoId = technician.technicianProfile?.photoId;

      // 3. Vincular nueva imagen
      await tx.technicianProfile.update({
        where: { userId: id },
        data: {
          photoId: image.id,
        },
      });

      // 4. Eliminar vieja imagen si existía
      if (oldPhotoId) {
        await tx.image.delete({
          where: { id: oldPhotoId },
        });
      }

      return this.findOne(id);
    });
  }
}
