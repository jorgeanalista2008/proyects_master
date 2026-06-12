import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        rutOrId: string;
        address: string | null;
        city: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            projects: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        rutOrId: string;
        address: string | null;
        city: string | null;
    })[]>;
    findOne(id: string): Promise<{
        projects: {
            id: string;
            name: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ProjectStatus;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        rutOrId: string;
        address: string | null;
        city: string | null;
    }>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        rutOrId: string;
        address: string | null;
        city: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
