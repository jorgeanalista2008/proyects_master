import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto): Promise<{
        client: {
            name: string;
            email: string;
        };
        manager: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ProjectStatus;
        clientId: string;
        managerId: string | null;
    }>;
    findAll(userRole?: string, userId?: string): Promise<({
        client: {
            name: string;
            email: string;
        };
        manager: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ProjectStatus;
        clientId: string;
        managerId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        client: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string;
            rutOrId: string;
            address: string | null;
            city: string | null;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        quotes: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            status: import("@prisma/client").$Enums.QuoteStatus;
            version: number;
            currency: import("@prisma/client").$Enums.CurrencyCode;
            total: import("@prisma/client-runtime-utils").Decimal;
        }[];
        surveyImages: {
            id: string;
            createdAt: Date;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ProjectStatus;
        clientId: string;
        managerId: string | null;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<{
        client: {
            name: string;
        };
        manager: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ProjectStatus;
        clientId: string;
        managerId: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
