import { PrismaService } from '../database/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllRoles(): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
        menus: ({
            menuItem: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                label: string;
                route: string;
                icon: string;
                order: number;
            };
        } & {
            roleId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRole(dto: {
        name: string;
        description?: string;
        permissions?: string[];
        menus?: string[];
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, dto: {
        name?: string;
        description?: string;
        permissions?: string[];
        menus?: string[];
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRole(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllPermissions(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllMenus(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        route: string;
        icon: string;
        order: number;
    }[]>;
    createMenu(dto: {
        label: string;
        route: string;
        icon: string;
        order?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        route: string;
        icon: string;
        order: number;
    }>;
    updateMenu(id: string, dto: {
        label?: string;
        route?: string;
        icon?: string;
        order?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        route: string;
        icon: string;
        order: number;
    }>;
    deleteMenu(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        route: string;
        icon: string;
        order: number;
    }>;
    findUserMenu(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        route: string;
        icon: string;
        order: number;
    }[]>;
}
