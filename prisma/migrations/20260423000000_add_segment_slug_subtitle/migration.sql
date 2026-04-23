-- AlterTable
ALTER TABLE `segments` ADD COLUMN `slug` VARCHAR(255) NULL;
ALTER TABLE `segments` ADD COLUMN `subtitle` VARCHAR(500) NULL;

-- CreateIndex (apenas se slug não for NULL)
CREATE UNIQUE INDEX `segments_slug_key` ON `segments`(`slug`);
