-- AlterTable
ALTER TABLE `segments` ADD COLUMN `icon` VARCHAR(100) NULL;

-- Update existing records: copy image to icon if icon is null
UPDATE `segments` SET `icon` = `image` WHERE `icon` IS NULL AND `image` IS NOT NULL;
