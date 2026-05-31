-- ตารางยี่ห้อรถ
CREATE TABLE `vehicle_brands` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`country` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_brands_id` PRIMARY KEY(`id`)
);

-- ตารางรุ่นรถ
CREATE TABLE `vehicle_models` (
	`id` varchar(36) NOT NULL,
	`brand_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50), -- sedan, suv, pickup, motorcycle, etc.
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_models_id` PRIMARY KEY(`id`)
);

-- ปรับปรุงตารางรถใหม่
CREATE TABLE `vehicles` (
	`id` varchar(36) NOT NULL,
	`customer_id` varchar(36) NOT NULL,
	`brand_id` varchar(36),
	`model_id` varchar(36),
	`brand_custom` varchar(100), -- กรณีไม่มีในระบบ
	`model_custom` varchar(100), -- กรณีไม่มีในระบบ
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

-- Indexes
CREATE INDEX `brand_idx` ON `vehicle_brands` (`name`);
CREATE INDEX `brand_model_idx` ON `vehicle_models` (`brand_id`);
CREATE INDEX `vehicle_brand_idx` ON `vehicles` (`brand_id`);
CREATE INDEX `vehicle_model_idx` ON `vehicles` (`model_id`);
CREATE INDEX `customer_idx` ON `vehicles` (`customer_id`);
CREATE INDEX `license_plate_idx` ON `vehicles` (`license_plate`);
CREATE INDEX `vin_idx` ON `vehicles` (`vin`);

-- Foreign Keys
ALTER TABLE `vehicle_models` ADD CONSTRAINT `fk_vehicle_model_brand` FOREIGN KEY (`brand_id`) REFERENCES `vehicle_brands`(`id`);
ALTER TABLE `vehicles` ADD CONSTRAINT `fk_vehicle_brand` FOREIGN KEY (`brand_id`) REFERENCES `vehicle_brands`(`id`);
ALTER TABLE `vehicles` ADD CONSTRAINT `fk_vehicle_model` FOREIGN KEY (`model_id`) REFERENCES `vehicle_models`(`id`);
