CREATE TABLE `reservas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`siloId` integer NOT NULL,
	`produtorId` integer NOT NULL,
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
CREATE TABLE `silos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`tipoSilo` text,
	`tipo` text,
	`cidade` text NOT NULL,
	`estado` text NOT NULL,
	`endereco` text,
	`cep` text,
	`lat` text,
	`lng` text,
	`latitude` text,
	`longitude` text,
	`capacidadeTotal` real NOT NULL,
	`capacidadeDisponivel` real,
	`preco` real DEFAULT 0 NOT NULL,
	`tiposGraos` text,
	`tiposGraosAceitos` text,
	`infraestrutura` text,
	`fotos` text,
	`documentos` text,
	`certificacoes` text,
	`status` text DEFAULT 'pendente',
	`disponivel` integer DEFAULT true,
	`motivoReprovacao` text,
	`avaliacaoMedia` real DEFAULT 0,
	`totalAvaliacoes` integer DEFAULT 0,
	`visualizacoes` integer DEFAULT 0,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`password` text,
	`telefone` text,
	`cpfCnpj` text,
	`loginMethod` text,
	`role` text DEFAULT 'user',
	`tipoUsuario` text,
	`verificado` integer DEFAULT false,
	`emailVerificado` integer DEFAULT false,
	`celularVerificado` integer DEFAULT false,
	`avaliacaoMedia` real DEFAULT 0,
	`totalAvaliacoes` integer DEFAULT 0,
	`createdAt` integer,
	`lastSignedIn` integer
);
--> statement-breakpoint
CREATE TABLE `verificationCodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`used` integer DEFAULT false,
	`createdAt` integer
);
