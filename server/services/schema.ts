import {
  boolean,
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 18 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Tipo de usuário no SiloShare
  tipoUsuario: mysqlEnum("tipoUsuario", ["produtor", "dono_silo", "transportadora"]),
  
  verificado: boolean("verificado").default(false),
  emailVerificado: boolean("emailVerificado").default(false),
  celularVerificado: boolean("celularVerificado").default(false),
  avaliacaoMedia: decimal("avaliacaoMedia", { precision: 3, scale: 2 }).default("0.00"),
  totalAvaliacoes: int("totalAvaliacoes").default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ========================================
 * TABELA DE PRODUTORES
 * ========================================
 */
export const produtores = mysqlTable("produtores", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  // Dados da propriedade principal
  nomePropriedade: varchar("nomePropriedade", { length: 255 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  area: int("area"), // em hectares
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  
  // Produção
  graosProducao: text("graosProducao"), // JSON array de strings
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Produtor = typeof produtores.$inferSelect;
export type InsertProdutor = typeof produtores.$inferInsert;

/**
 * ========================================
 * TABELA DE SILOS
 * ========================================
 */
export const silos = mysqlTable("silos", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(), // Dono do silo
  
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Localização
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  endereco: text("endereco"),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  
  // Capacidade
  capacidadeTotal: int("capacidadeTotal").notNull(), // em toneladas
  capacidadeDisponivel: int("capacidadeDisponivel").notNull(), // em toneladas
  
  // Preços
  precoTonelada: decimal("precoTonelada", { precision: 10, scale: 2 }).notNull(), // R$ por tonelada/mês
  
  // Tipos de grãos aceitos
  tiposGraos: text("tiposGraos").notNull(), // JSON array de strings
  
  // Infraestrutura
  infraSecagem: boolean("infraSecagem").default(false),
  infraLimpeza: boolean("infraLimpeza").default(false),
  infraAeracao: boolean("infraAeracao").default(false),
  infraMonitoramento: boolean("infraMonitoramento").default(false),
  
  // Avaliações
  avaliacaoMedia: decimal("avaliacaoMedia", { precision: 3, scale: 2 }).default("0.00"),
  totalAvaliacoes: int("totalAvaliacoes").default(0),
  
  // Imagens
  imagemUrl: varchar("imagemUrl", { length: 500 }),
  fotos: text("fotos"), // JSON array de URLs de fotos
  
  // Status
  disponivel: boolean("disponivel").default(true),
  ativo: boolean("ativo").default(true),
  
  // Status de aprovação
  statusAprovacao: mysqlEnum("statusAprovacao", ["pendente", "aprovado", "reprovado", "aguardando_documentos"]).default("pendente").notNull(),
  motivoReprovacao: text("motivoReprovacao"),
  aprovadoPor: varchar("aprovadoPor", { length: 64 }), // ID do admin que aprovou
  aprovadoEm: timestamp("aprovadoEm"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Silo = typeof silos.$inferSelect;
export type InsertSilo = typeof silos.$inferInsert;

/**
 * ========================================
 * TABELA DE TRANSPORTADORAS
 * ========================================
 */
export const transportadoras = mysqlTable("transportadoras", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  nomeEmpresa: varchar("nomeEmpresa", { length: 255 }),
  
  // Frota
  frotaTotal: int("frotaTotal").default(0),
  frotaDetalhes: text("frotaDetalhes"), // JSON array de veículos
  
  // Áreas de atuação
  areasAtuacao: text("areasAtuacao"), // JSON array de estados
  
  // Avaliações
  avaliacaoMedia: decimal("avaliacaoMedia", { precision: 3, scale: 2 }).default("0.00"),
  totalAvaliacoes: int("totalAvaliacoes").default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Transportadora = typeof transportadoras.$inferSelect;
export type InsertTransportadora = typeof transportadoras.$inferInsert;

/**
 * ========================================
 * TABELA DE RESERVAS
 * ========================================
 */
export const reservas = mysqlTable("reservas", {
  id: int("id").primaryKey().autoincrement(),
  
  siloId: int("siloId").notNull(),
  siloNome: varchar("siloNome", { length: 255 }).notNull(),
  
  produtorId: varchar("produtorId", { length: 64 }).notNull(),
  produtorNome: varchar("produtorNome", { length: 255 }).notNull(),
  
  // Detalhes da reserva
  tipoGrao: varchar("tipoGrao", { length: 100 }).notNull(),
  quantidade: int("quantidade").notNull(), // em toneladas
  
  dataInicio: datetime("dataInicio").notNull(),
  dataFim: datetime("dataFim").notNull(),
  
  valorTotal: decimal("valorTotal", { precision: 12, scale: 2 }).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "pendente",
    "confirmada",
    "em_andamento",
    "concluida",
    "cancelada",
  ]).default("pendente").notNull(),
  
  // Transporte
  necessitaTransporte: boolean("necessitaTransporte").default(false),
  cotacaoSelecionadaId: int("cotacaoSelecionadaId"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Reserva = typeof reservas.$inferSelect;
export type InsertReserva = typeof reservas.$inferInsert;

/**
 * ========================================
 * TABELA DE COTAÇÕES DE TRANSPORTE
 * ========================================
 */
export const cotacoesTransporte = mysqlTable("cotacoesTransporte", {
  id: int("id").primaryKey().autoincrement(),
  
  reservaId: int("reservaId").notNull(),
  
  transportadoraId: varchar("transportadoraId", { length: 64 }).notNull(),
  transportadoraNome: varchar("transportadoraNome", { length: 255 }).notNull(),
  
  // Detalhes da cotação
  valorFrete: decimal("valorFrete", { precision: 10, scale: 2 }).notNull(),
  prazoEntrega: int("prazoEntrega").notNull(), // em dias
  tipoVeiculo: varchar("tipoVeiculo", { length: 100 }).notNull(),
  
  // Avaliação da transportadora
  avaliacaoMedia: decimal("avaliacaoMedia", { precision: 3, scale: 2 }).default("0.00"),
  
  // Status
  status: mysqlEnum("status", ["pendente", "aceita", "recusada"]).default("pendente").notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type CotacaoTransporte = typeof cotacoesTransporte.$inferSelect;
export type InsertCotacaoTransporte = typeof cotacoesTransporte.$inferInsert;

/**
 * ========================================
 * TABELA DE AVALIAÇÕES
 * ========================================
 */
export const avaliacoes = mysqlTable("avaliacoes", {
  id: int("id").primaryKey().autoincrement(),
  
  // Quem avaliou
  avaliadorId: varchar("avaliadorId", { length: 64 }).notNull(),
  avaliadorNome: varchar("avaliadorNome", { length: 255 }).notNull(),
  
  // Quem foi avaliado
  avaliadoId: varchar("avaliadoId", { length: 64 }).notNull(),
  avaliadoTipo: mysqlEnum("avaliadoTipo", ["silo", "produtor", "transportadora"]).notNull(),
  
  // Avaliação
  nota: int("nota").notNull(), // 1-5
  comentario: text("comentario"),
  
  // Referência (opcional)
  reservaId: int("reservaId"),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Avaliacao = typeof avaliacoes.$inferSelect;
export type InsertAvaliacao = typeof avaliacoes.$inferInsert;

/**
 * ========================================
 * TABELA DE MENSAGENS/CHAT
 * ========================================
 */
export const mensagens = mysqlTable("mensagens", {
  id: int("id").primaryKey().autoincrement(),
  
  remetenteId: varchar("remetenteId", { length: 64 }).notNull(),
  remetenteNome: varchar("remetenteNome", { length: 255 }).notNull(),
  
  destinatarioId: varchar("destinatarioId", { length: 64 }).notNull(),
  destinatarioNome: varchar("destinatarioNome", { length: 255 }).notNull(),
  
  mensagem: text("mensagem").notNull(),
  
  // Referência (opcional)
  reservaId: int("reservaId"),
  
  lida: boolean("lida").default(false),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Mensagem = typeof mensagens.$inferSelect;
export type InsertMensagem = typeof mensagens.$inferInsert;

/**
 * ========================================
 * TABELA DE CÓDIGOS DE VERIFICAÇÃO
 * ========================================
 */
export const verificationCodes = mysqlTable("verificationCodes", {
  id: int("id").primaryKey().autoincrement(),
  
  userId: varchar("userId", { length: 64 }).notNull(),
  
  tipo: mysqlEnum("tipo", ["email", "celular"]).notNull(),
  codigo: varchar("codigo", { length: 6 }).notNull(),
  
  expiresAt: timestamp("expiresAt").notNull(),
  usado: boolean("usado").default(false),
  tentativas: int("tentativas").default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = typeof verificationCodes.$inferInsert;


/**
 * ========================================
 * TABELA DE DOCUMENTOS DE SILOS
 * ========================================
 */
export const documentosSilos = mysqlTable("documentosSilos", {
  id: int("id").primaryKey().autoincrement(),
  
  siloId: int("siloId").notNull(),
  
  // Tipo de documento
  tipo: varchar("tipo", { length: 100 }).notNull(), // cnpj, escritura, alvara, avcb, conab, etc
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Arquivo
  url: varchar("url", { length: 500 }).notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 255 }),
  tamanho: int("tamanho"), // em bytes
  
  // Status
  obrigatorio: boolean("obrigatorio").default(false),
  verificado: boolean("verificado").default(false),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type DocumentoSilo = typeof documentosSilos.$inferSelect;
export type InsertDocumentoSilo = typeof documentosSilos.$inferInsert;

/**
 * ========================================
 * TABELA DE RASCUNHOS DE CADASTRO (AUTO-SAVE)
 * ========================================
 */
export const cadastrosRascunho = mysqlTable("cadastrosRascunho", {
  id: int("id").primaryKey().autoincrement(),
  
  userId: varchar("userId", { length: 64 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(), // Ex: "cadastro-silo"
  
  data: text("data").notNull(), // JSON stringificado com todos os dados
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type CadastroRascunho = typeof cadastrosRascunho.$inferSelect;
export type InsertCadastroRascunho = typeof cadastrosRascunho.$inferInsert;

/**
 * ========================================
 * TABELA DE DOCUMENTOS DE PRODUTORES
 * ========================================
 */
export const documentosProdutores = mysqlTable("documentosProdutores", {
  id: int("id").primaryKey().autoincrement(),
  
  userId: varchar("userId", { length: 64 }).notNull(),
  reservaId: int("reservaId"), // Opcional - pode ser vinculado a uma reserva específica
  
  // Tipo de documento
  tipo: varchar("tipo", { length: 100 }).notNull(), // cpf_cnpj, comprovante_endereco, nota_fiscal
  nome: varchar("nome", { length: 255 }).notNull(),
  
  // Arquivo
  url: varchar("url", { length: 500 }).notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 255 }),
  tamanho: int("tamanho"), // em bytes
  
  // Status
  verificado: boolean("verificado").default(false),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type DocumentoProdutor = typeof documentosProdutores.$inferSelect;
export type InsertDocumentoProdutor = typeof documentosProdutores.$inferInsert;

