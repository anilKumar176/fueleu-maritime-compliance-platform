CREATE TABLE `banking_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vessel_name` text NOT NULL,
	`year` integer NOT NULL,
	`banked_cb` real NOT NULL,
	`applied_cb` real NOT NULL,
	`remaining_cb` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pool_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pool_id` integer,
	`vessel_name` text NOT NULL,
	`contribution_cb` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pool_name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_name` text NOT NULL,
	`vessel_name` text NOT NULL,
	`distance_nm` real NOT NULL,
	`fuel_consumed_mt` real NOT NULL,
	`ghg_intensity` real NOT NULL,
	`reference_ghg_intensity` real NOT NULL,
	`compliance_balance` real NOT NULL,
	`year` integer NOT NULL,
	`created_at` text NOT NULL
);
