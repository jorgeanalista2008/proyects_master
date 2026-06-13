import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('No autenticado o sesión inválida.');
    }

    // Cargar permisos desde la base de datos
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
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

    if (!dbUser || !dbUser.role) {
      throw new ForbiddenException('Usuario o rol no encontrado.');
    }

    // Si es super administrador, tiene acceso ilimitado
    if (dbUser.role.name === 'ADMIN') {
      return true;
    }

    const userPermissions = dbUser.role.permissions.map((rp) => rp.permission.name);

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Acceso denegado. Se requieren los permisos: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
