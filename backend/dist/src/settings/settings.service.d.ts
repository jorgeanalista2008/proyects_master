import { PrismaService } from '../database/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        logoId: string | null;
        appName: string;
        address: string | null;
        website: string | null;
        primaryColor: string;
        accentColor: string;
        defaultTheme: string;
        fontStyle: string;
    }>;
    updateSettings(dto: UpdateSettingDto): Promise<{
        id: string;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        logoId: string | null;
        appName: string;
        address: string | null;
        website: string | null;
        primaryColor: string;
        accentColor: string;
        defaultTheme: string;
        fontStyle: string;
    }>;
    uploadLogo(file: Express.Multer.File): Promise<{
        logoId: string;
        fileName: string;
        mimeType: string;
    }>;
    getCategories(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
    }[]>;
    createCategory(name: string, label: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
    }>;
}
