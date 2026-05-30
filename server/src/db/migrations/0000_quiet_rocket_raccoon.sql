CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('product','service') NOT NULL,
	`parent_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean DEFAULT true,
	`surcharge_percent` decimal(5,2) DEFAULT '0',
	`discount_percent` decimal(5,2) DEFAULT '0',
	`sort_order` int DEFAULT 0,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_tiers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_default` boolean DEFAULT false,
	CONSTRAINT `pricing_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('product','service') NOT NULL,
	`has_variants` boolean DEFAULT false,
	`has_labor_cost` boolean DEFAULT false,
	`base_price` decimal(12,2),
	`labor_price` decimal(12,2),
	`cost_price` decimal(12,2),
	`cost_method` enum('fifo','average','manual') DEFAULT 'average',
	`unit_id` varchar(36),
	`sku` varchar(100),
	`barcode` varchar(100),
	`min_stock` decimal(12,2) DEFAULT '0',
	`alert_enabled` boolean DEFAULT true,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` varchar(255),
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` varchar(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_default` boolean DEFAULT false,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`role` enum('owner','staff') NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `sku_idx` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `barcode_idx` ON `products` (`barcode`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);