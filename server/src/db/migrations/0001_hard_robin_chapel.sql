CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20),
	`email` varchar(100),
	`address` text,
	`province` varchar(100),
	`district` varchar(100),
	`subdistrict` varchar(100),
	`zipcode` varchar(10),
	`tax_id` varchar(20),
	`note` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);

CREATE TABLE `product_groups` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku_prefix` varchar(10),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_groups_id` PRIMARY KEY(`id`)
);

CREATE TABLE `vehicles` (
	`id` varchar(36) NOT NULL,
	`customer_id` varchar(36) NOT NULL,
	`brand` varchar(100),
	`model` varchar(100),
	`year` varchar(4),
	`color` varchar(50),
	`license_plate` varchar(20),
	`vin` varchar(50),
	`engine_number` varchar(50),
	`mileage` decimal(10,2),
	`note` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);

ALTER TABLE `products` ADD `group_id` varchar(36);
ALTER TABLE `products` ADD `variant_name` varchar(255);
ALTER TABLE `products` ADD `price` decimal(12,2);
ALTER TABLE `products` ADD `stock` decimal(12,2) DEFAULT '0';
CREATE INDEX `name_idx` ON `customers` (`name`);
CREATE INDEX `phone_idx` ON `customers` (`phone`);
CREATE INDEX `email_idx` ON `customers` (`email`);
CREATE INDEX `name_idx` ON `product_groups` (`name`);
CREATE INDEX `sku_prefix_idx` ON `product_groups` (`sku_prefix`);
CREATE INDEX `customer_idx` ON `vehicles` (`customer_id`);
CREATE INDEX `license_plate_idx` ON `vehicles` (`license_plate`);
CREATE INDEX `vin_idx` ON `vehicles` (`vin`);
CREATE INDEX `group_idx` ON `products` (`group_id`);
CREATE INDEX `variant_idx` ON `products` (`variant_name`);
ALTER TABLE `products` DROP COLUMN `has_variants`;
ALTER TABLE `products` DROP COLUMN `base_price`;