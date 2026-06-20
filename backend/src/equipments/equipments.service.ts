import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentStatus } from '@prisma/client';

@Injectable()
export class EquipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const {
      clientName,
      clientId,
      equipmentType,
      brand,
      model,
      serialNumber,
      issueDescription,
      technicianId,
    } = createEquipmentDto;

    const initialStatus = technicianId ? EquipmentStatus.ASSIGNED : EquipmentStatus.RECEIVED;
    const assignedAt = technicianId ? new Date() : null;

    const equipment = await this.prisma.equipmentReceipt.create({
      data: {
        clientName,
        clientId: clientId || null,
        equipmentType,
        brand,
        model,
        serialNumber,
        issueDescription,
        status: initialStatus,
        technicianId: technicianId || null,
        assignedAt,
      },
      include: {
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        client: true,
        images: true,
      },
    });

    // Crear alerta para el técnico si fue asignado inmediatamente
    if (technicianId) {
      await this.prisma.equipmentAlert.create({
        data: {
          equipmentReceiptId: equipment.id,
          userId: technicianId,
          message: `Se te ha asignado el equipo: ${brand} ${model} (${serialNumber})`,
        },
      });
    }

    return equipment;
  }

  async findAll(role: string, userId: string) {
    const whereClause: any = {};

    if (role === 'TECHNICIAN') {
      whereClause.technicianId = userId;
    } else if (role === 'CLIENT') {
      whereClause.clientId = userId;
    }

    return this.prisma.equipmentReceipt.findMany({
      where: whereClause,
      include: {
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        client: true,
        images: {
          select: { id: true, fileName: true, mimeType: true, createdAt: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipmentReceipt.findUnique({
      where: { id },
      include: {
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        client: true,
        images: {
          select: { id: true, fileName: true, mimeType: true, createdAt: true },
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado.`);
    }

    return equipment;
  }

  async assignTechnician(id: string, technicianId: string) {
    const equipment = await this.findOne(id);

    const isFirstAssignment = equipment.status === EquipmentStatus.RECEIVED;
    const newStatus = isFirstAssignment ? EquipmentStatus.ASSIGNED : equipment.status;
    const assignedAt = isFirstAssignment ? new Date() : equipment.assignedAt;

    const updatedEquipment = await this.prisma.equipmentReceipt.update({
      where: { id },
      data: {
        technicianId,
        status: newStatus,
        assignedAt,
      },
      include: {
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        client: true,
      },
    });

    // Crear alerta para el técnico
    await this.prisma.equipmentAlert.create({
      data: {
        equipmentReceiptId: id,
        userId: technicianId,
        message: `Se te ha asignado el equipo: ${equipment.brand} ${equipment.model} (${equipment.serialNumber})`,
      },
    });

    return updatedEquipment;
  }

  async updateStatus(
    id: string,
    status: EquipmentStatus,
    currentUserId: string,
    currentUserRole: string,
    technicalNotes?: string,
  ) {
    const equipment = await this.findOne(id);

    // Validar transiciones de estado y roles
    // Técnico solo puede marcar IN_PROGRESS y REPAIRED para sus propios equipos
    if (currentUserRole === 'TECHNICIAN') {
      if (equipment.technicianId !== currentUserId) {
        throw new ForbiddenException('No tienes permiso para actualizar este equipo ya que no está asignado a ti.');
      }
      if (status !== EquipmentStatus.IN_PROGRESS && status !== EquipmentStatus.REPAIRED) {
        throw new ForbiddenException('Como técnico, solo puedes actualizar el estado a "En Revisión" o "Reparado".');
      }
    }

    const updateData: any = { status };

    if (technicalNotes !== undefined) {
      updateData.technicalNotes = technicalNotes;
    }

    if (status === EquipmentStatus.IN_PROGRESS && !equipment.assignedAt) {
      updateData.assignedAt = new Date();
    } else if (status === EquipmentStatus.REPAIRED) {
      updateData.repairedAt = new Date();
    } else if (status === EquipmentStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const updatedEquipment = await this.prisma.equipmentReceipt.update({
      where: { id },
      data: updateData,
      include: {
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        client: true,
      },
    });

    // Crear alertas según corresponda
    if (status === EquipmentStatus.REPAIRED) {
      // Notificar a todos los administradores
      const admins = await this.prisma.user.findMany({
        where: {
          role: {
            name: 'ADMIN',
          },
        },
      });

      const techName = updatedEquipment.technician 
        ? `${updatedEquipment.technician.firstName} ${updatedEquipment.technician.lastName}`
        : 'Un técnico';

      for (const admin of admins) {
        await this.prisma.equipmentAlert.create({
          data: {
            equipmentReceiptId: id,
            userId: admin.id,
            message: `El técnico ${techName} ha marcado el equipo ${equipment.brand} ${equipment.model} (${equipment.serialNumber}) como REPARADO.`,
          },
        });
      }
    }

    return updatedEquipment;
  }

  async remove(id: string) {
    const equipment = await this.findOne(id);
    await this.prisma.equipmentReceipt.delete({
      where: { id },
    });
    return { success: true, message: `Equipo ${equipment.brand} ${equipment.model} eliminado correctamente.` };
  }

  // --- Lógica de Alertas ---
  async getMyAlerts(userId: string) {
    return this.prisma.equipmentAlert.findMany({
      where: {
        userId,
        isRead: false,
      },
      include: {
        equipmentReceipt: {
          select: { id: true, brand: true, model: true, serialNumber: true, status: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAlertAsRead(alertId: string, userId: string) {
    const alert = await this.prisma.equipmentAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta con ID ${alertId} no encontrada o no pertenece al usuario.`);
    }

    return this.prisma.equipmentAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  async markAllAlertsAsRead(userId: string) {
    return this.prisma.equipmentAlert.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
