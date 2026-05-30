CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`parts` text NOT NULL,
	`model` text,
	`finish_reason` text,
	`prompt_tokens` integer,
	`completion_tokens` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_session_created_idx` ON `messages` (`session_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
