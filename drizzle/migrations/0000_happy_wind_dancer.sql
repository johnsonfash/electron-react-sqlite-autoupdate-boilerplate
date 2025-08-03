CREATE TABLE `invoice_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now'))
);
--> statement-breakpoint
CREATE TABLE `printers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`isDefault` integer DEFAULT false,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'USER',
	`createdAt` integer DEFAULT (strftime('%s','now')),
	`updatedAt` integer DEFAULT (strftime('%s','now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);