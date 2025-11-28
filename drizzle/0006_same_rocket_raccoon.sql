CREATE TABLE `contratos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reservaId` integer NOT NULL,
	`proprietarioId` text NOT NULL,
	`produtorId` text NOT NULL,
	`conteudo` text NOT NULL,
	`status` text NOT NULL,
	`assinaturaProdutor` text,
	`assinaturaProprietario` text,
	`pdfUrl` text,
	`createdAt` integer,
	`signedAt` integer
);
