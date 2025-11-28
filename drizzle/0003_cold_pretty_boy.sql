CREATE TABLE `avaliacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`siloId` integer NOT NULL,
	`userId` text NOT NULL,
	`reservaId` integer NOT NULL,
	`nota` integer NOT NULL,
	`comentario` text,
	`createdAt` integer
);
