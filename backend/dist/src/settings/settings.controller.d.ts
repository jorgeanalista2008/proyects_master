import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findOne(): Promise<{
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
    update(updateSettingDto: UpdateSettingDto): Promise<{
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
    findCategories(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
    }[]>;
    createCategory(body: {
        name: string;
        label: string;
    }): Promise<{
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
