import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findOne(): Promise<{
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
    update(updateSettingDto: UpdateSettingDto): Promise<{
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
    findCategories(): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        label: string;
    }[]>;
    createCategory(body: {
        name: string;
        label: string;
    }): Promise<{
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
