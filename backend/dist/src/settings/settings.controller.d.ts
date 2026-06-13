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
    }>;
    uploadLogo(file: Express.Multer.File): Promise<{
        logoId: string;
        fileName: string;
        mimeType: string;
    }>;
}
