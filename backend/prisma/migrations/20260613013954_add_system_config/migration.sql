-- AlterTable
ALTER TABLE `image` MODIFY `type` ENUM('PRODUCT_THUMBNAIL', 'PROJECT_SURVEY', 'TECHNICIAN_PHOTO', 'COMPANY_LOGO') NOT NULL;

-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global',
    `appName` VARCHAR(191) NOT NULL DEFAULT 'SecurityNet S.A.',
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `logoId` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#1e3a8a',
    `accentColor` VARCHAR(191) NOT NULL DEFAULT '#94a3b8',
    `defaultTheme` VARCHAR(191) NOT NULL DEFAULT 'dark',
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemConfig_logoId_key`(`logoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
