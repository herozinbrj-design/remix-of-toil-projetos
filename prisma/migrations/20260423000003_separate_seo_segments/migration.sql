-- CreateTable
CREATE TABLE `seo_segments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(100) NULL,
  `image` VARCHAR(500) NULL,
  `gallery` TEXT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `order` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `seo_segments_name_key`(`name`),
  UNIQUE INDEX `seo_segments_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Remove campos desnecessários da tabela segments (se existirem)
ALTER TABLE `segments` DROP COLUMN `slug`;
ALTER TABLE `segments` DROP COLUMN `subtitle`;
ALTER TABLE `segments` DROP COLUMN `image`;
ALTER TABLE `segments` DROP COLUMN `gallery`;

