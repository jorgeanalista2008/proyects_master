import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        role: {
            name: import("@prisma/client").$Enums.RoleName;
            description: string | null;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        role: {
            name: import("@prisma/client").$Enums.RoleName;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        role: {
            name: import("@prisma/client").$Enums.RoleName;
            description: string | null;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    findOneByEmail(email: string): Promise<({
        role: {
            id: string;
            name: import("@prisma/client").$Enums.RoleName;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
        roleId: string;
    }) | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        role: {
            name: import("@prisma/client").$Enums.RoleName;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
    }>;
}
