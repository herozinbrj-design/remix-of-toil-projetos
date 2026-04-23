-- CreateTable
CREATE TABLE `header_menus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `link` VARCHAR(500) NULL,
    `parentId` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `header_menus_parentId_idx`(`parentId`),
    INDEX `header_menus_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `header_menus` ADD CONSTRAINT `header_menus_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `header_menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
