-- AlterTable
ALTER TABLE `banners` ADD COLUMN `ctaPrimary` VARCHAR(255) NULL,
    ADD COLUMN `ctaSecondary` VARCHAR(255) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `overlayColor` VARCHAR(20) NULL DEFAULT '#0a1628',
    ADD COLUMN `overlayOpacity` INTEGER NULL DEFAULT 70;
