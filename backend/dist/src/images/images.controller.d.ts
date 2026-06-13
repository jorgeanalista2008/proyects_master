import type { Response } from 'express';
import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly imagesService;
    constructor(imagesService: ImagesService);
    serveImage(id: string, res: Response): Promise<void>;
    uploadProductImage(productId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ImageType;
        fileName: string;
        mimeType: string;
        productId: string | null;
    }>;
    uploadProjectSurveyImage(projectId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ImageType;
        fileName: string;
        mimeType: string;
        projectId: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
