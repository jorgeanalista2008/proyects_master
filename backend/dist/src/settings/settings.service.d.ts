import { PrismaService } from '../database/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        appName: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        website: string | null;
        primaryColor: string;
        accentColor: string;
        defaultTheme: string;
        id: string;
        logoId: string | null;
        updatedAt: Date;
    }>;
    updateSettings(dto: UpdateSettingDto): Promise<{
        appName: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        website: string | null;
        primaryColor: string;
        accentColor: string;
        defaultTheme: string;
        id: string;
        logoId: string | null;
        updatedAt: Date;
    }>;
    uploadLogo(file: Express.Multer.File): Promise<{
        logoId: string;
        fileName: string;
        mimeType: string;
    }>;
    getCategories(): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        label: string;
    }[]>;
    createCategory(name: string, label: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        label: string;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        label: string;
    }>;
}
