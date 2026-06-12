import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const { rutOrId, name, email, phone, address, city } = createClientDto;

    // Verificar si el cliente con esa identificación fiscal ya existe
    const existingClient = await this.prisma.client.findUnique({
      where: { rutOrId },
    });

    if (existingClient) {
      throw new ConflictException(`El cliente con identificación fiscal ${rutOrId} ya existe.`);
    }

    return this.prisma.client.create({
      data: {
        name,
        rutOrId,
        email,
        phone,
        address,
        city,
      },
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    const { rutOrId } = updateClientDto;
    if (rutOrId && rutOrId !== client.rutOrId) {
      const existingClient = await this.prisma.client.findUnique({ where: { rutOrId } });
      if (existingClient) {
        throw new ConflictException(`La identificación fiscal ${rutOrId} ya está registrada por otro cliente.`);
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    // No permitir eliminar si tiene proyectos asociados
    const projectCount = await this.prisma.project.count({
      where: { clientId: id },
    });

    if (projectCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el cliente porque tiene ${projectCount} proyecto(s) asociado(s).`,
      );
    }

    await this.prisma.client.delete({ where: { id } });
    return { success: true, message: 'Cliente eliminado correctamente.' };
  }
}
