CREATE TABLE `reserva_historico` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reservaId` integer NOT NULL,
	`userId` text NOT NULL,
	`acao` text NOT NULL,
	`detalhes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reservas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`siloId` integer NOT NULL,
	`produtorId` text NOT NULL,
	`capacidadeReservada` real NOT NULL,
	`dataInicio` integer NOT NULL,
	`dataFim` integer NOT NULL,
	`valorTotal` real NOT NULL,
	`status` text DEFAULT 'pendente',
	`pagamentoStatus` text DEFAULT 'pendente',
	`contratoUrl` text,
	`createdAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_reservas`("id", "siloId", "produtorId", "capacidadeReservada", "dataInicio", "dataFim", "valorTotal", "status", "pagamentoStatus", "contratoUrl", "createdAt") SELECT "id", "siloId", "produtorId", "capacidadeReservada", "dataInicio", "dataFim", "valorTotal", "status", "pagamentoStatus", "contratoUrl", "createdAt" FROM `reservas`;--> statement-breakpoint
DROP TABLE `reservas`;--> statement-breakpoint
ALTER TABLE `__new_reservas` RENAME TO `reservas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;