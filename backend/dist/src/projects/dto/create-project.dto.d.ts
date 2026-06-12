import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    clientId: string;
    managerId?: string;
    status?: ProjectStatus;
}
