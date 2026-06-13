-- AlterTable
ALTER TABLE `image` MODIFY `type` ENUM('PRODUCT_THUMBNAIL', 'PROJECT_SURVEY', 'TECHNICIAN_PHOTO') NOT NULL;

-- CreateTable
CREATE TABLE `TechnicianProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `documentNumber` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `academicLevel` VARCHAR(191) NULL,
    `profession` VARCHAR(191) NULL,
    `trade` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `landmark` TEXT NULL,
    `shirtSize` VARCHAR(191) NULL,
    `pantsSize` VARCHAR(191) NULL,
    `shoeSize` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `photoId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TechnicianProfile_userId_key`(`userId`),
    UNIQUE INDEX `TechnicianProfile_documentNumber_key`(`documentNumber`),
    UNIQUE INDEX `TechnicianProfile_photoId_key`(`photoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TechnicianProfile` ADD CONSTRAINT `TechnicianProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
