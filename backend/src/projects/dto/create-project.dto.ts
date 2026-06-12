import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
  status?: ProjectStatus;
}
