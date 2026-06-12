import { PrismaService } from '../database/prisma.service';
export declare class ImagesService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadProductImage(productId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        fileName: string;
        mimeType: string;
        type: import("@prisma/client").$Enums.ImageType;
        productId: string | null;
    }>;
    uploadProjectSurveyImage(projectId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        fileName: string;
        mimeType: string;
        type: import("@prisma/client").$Enums.ImageType;
        projectId: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        fileName: string;
        mimeType: string;
        fileData: import("@prisma/client/runtime/client").Bytes;
        type: import("@prisma/client").$Enums.ImageType;
        productId: string | null;
        projectId: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
