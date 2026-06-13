import { PrismaService } from '../database/prisma.service';
export declare class ImagesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ImageType;
        fileName: string;
        mimeType: string;
        fileData: import("@prisma/client/runtime/client").Bytes;
        productId: string | null;
        projectId: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
