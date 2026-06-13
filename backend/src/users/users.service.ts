import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, phone, roleName } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    // Buscar el rol correspondiente
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`El rol ${roleName} no fue encontrado.`);
    }

    // Encriptar la contraseña (si no se provee, asignamos una por defecto)
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

  async findOne(id: string) {
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
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  async findOneByEmail(email: string) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const { password, roleName, ...rest } = updateUserDto;
    const updateData: any = { ...rest };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (roleName) {
      const role = await this.prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        throw new NotFoundException(`El rol ${roleName} no fue encontrado.`);
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

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    // Desactivar al usuario en lugar de borrarlo físicamente para preservar el historial relacional
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  }
}
