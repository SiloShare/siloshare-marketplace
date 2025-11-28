CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1Id` text NOT NULL,
	`user2Id` text NOT NULL,
	`lastMessageAt` integer,
	`createdAt` integer
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversationId` integer NOT NULL,
	`senderId` text NOT NULL,
	`receiverId` text NOT NULL,
	`content` text NOT NULL,
	`read` integer DEFAULT false,
	`createdAt` integer
);
