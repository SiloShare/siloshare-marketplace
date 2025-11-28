CREATE TABLE `pagamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reservaId` integer NOT NULL,
	`userId` text NOT NULL,
	`valor` real NOT NULL,
	`status` text NOT NULL,
	`stripeSessionId` text,
	`stripePaymentIntentId` text,
	`metadata` text,
	`createdAt` integer,
	`paidAt` integer
);
