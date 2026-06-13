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
            name: string;
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
            id: string;
            name: string;
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
            id: string;
            name: string;
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
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }) | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
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
