import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { name, description, clientId, managerId, status } = createProjectDto;

    // Verificar si el cliente existe
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException('El cliente especificado no existe.');
    }

    // Si se especifica un manager (técnico), verificar que exista
    if (managerId) {
      const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
      if (!manager) {
        throw new NotFoundException('El usuario técnico/manager especificado no existe.');
      }
    }

    return this.prisma.project.create({
      data: {
        name,
        description,
        clientId,
        managerId,
        status: status || 'PENDING',
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userRole?: string, userId?: string) {
    // Si el usuario es un CLIENTE, filtramos sus propios proyectos por coincidencia de email
    if (userRole === 'CLIENT' && userId) {
      const clientUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (clientUser) {
        return this.prisma.project.findMany({
          where: {
            client: {
              email: clientUser.email,
            },
          },
          include: {
            client: { select: { name: true, email: true } },
            manager: { select: { firstName: true, lastName: true } },
          },
        });
      }
    }

    // Si el usuario es un TÉCNICO, solo ve los proyectos asignados
    if (userRole === 'TECHNICIAN' && userId) {
      return this.prisma.project.findMany({
        where: { managerId: userId },
        include: {
          client: { select: { name: true, email: true } },
          manager: { select: { firstName: true, lastName: true } },
        },
      });
    }

    // ADMIN o SELLER ven todos
    return this.prisma.project.findMany({
      include: {
        client: { select: { name: true, email: true } },
        manager: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        quotes: {
          select: {
            id: true,
            version: true,
            status: true,
            total: true,
            currency: true,
            isActive: true,
            createdAt: true,
          },
        },
        surveyImages: {
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    return {
      ...project,
      images: project.surveyImages,
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    const { clientId, managerId } = updateProjectDto;

    if (clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundException('El cliente especificado no existe.');
      }
    }

    if (managerId) {
      const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
      if (!manager) {
        throw new NotFoundException('El usuario técnico/manager especificado no existe.');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        client: { select: { name: true } },
        manager: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    await this.prisma.project.delete({ where: { id } });
    return { success: true, message: 'Proyecto y recursos asociados eliminados correctamente.' };
  }
}
