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

CREATE INDEX `customer_idx` ON `vehicles` (`customer_id`);
CREATE INDEX `license_plate_idx` ON `vehicles` (`license_plate`);
CREATE INDEX `vin_idx` ON `vehicles` (`vin`);
