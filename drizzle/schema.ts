import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

/**
 * ========================================
 * TABELA DE USUÁRIOS
 * ========================================
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  telefone: text("telefone"),
  cpfCnpj: text("cpfCnpj"),
  avatarUrl: text("avatarUrl"),
  loginMethod: text("loginMethod"),
  role: text("role").default("user"),
  tipoUsuario: text("tipoUsuario"),
  verificado: integer("verificado", { mode: "boolean" }).default(false),
  emailVerificado: integer("emailVerificado", { mode: "boolean" }).default(false),
  celularVerificado: integer("celularVerificado", { mode: "boolean" }).default(false),
  avaliacaoMedia: real("avaliacaoMedia").default(0),
  totalAvaliacoes: integer("totalAvaliacoes").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ========================================
 * TABELA DE CÓDIGOS DE VERIFICAÇÃO
 * ========================================
 */
export const verificationCodes = sqliteTable("verificationCodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }),
});

/**
 * ========================================
 * TABELA DE SILOS
 * ========================================
 */
export const silos = sqliteTable("silos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  tipoSilo: text("tipoSilo"),
  tipo: text("tipo"),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  endereco: text("endereco"),
  cep: text("cep"),
  lat: text("lat"),
  lng: text("lng"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  capacidadeTotal: real("capacidadeTotal").notNull(),
  capacidadeDisponivel: real("capacidadeDisponivel"),
  preco: real("preco").notNull().default(0),
  tiposGraos: text("tiposGraos"),
  tiposGraosAceitos: text("tiposGraosAceitos"),
  infraestrutura: text("infraestrutura"),
  fotos: text("fotos"),
  documentos: text("documentos"),
  certificacoes: text("certificacoes"),
  status: text("status").default("pendente"),
  disponivel: integer("disponivel", { mode: "boolean" }).default(true),
  motivoReprovacao: text("motivoReprovacao"),
  avaliacaoMedia: real("avaliacaoMedia").default(0),
  totalAvaliacoes: integer("totalAvaliacoes").default(0),
  visualizacoes: integer("visualizacoes").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export type Silo = typeof silos.$inferSelect;
export type InsertSilo = typeof silos.$inferInsert;

/**
 * ========================================
 * TABELA DE RESERVAS
 * ========================================
 */
export const reservas = sqliteTable("reservas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siloId: integer("siloId").notNull(),
  produtorId: text("produtorId").notNull(),
  capacidadeReservada: real("capacidadeReservada").notNull(),
  dataInicio: integer("dataInicio", { mode: "timestamp" }).notNull(),
  dataFim: integer("dataFim", { mode: "timestamp" }).notNull(),
  valorTotal: real("valorTotal").notNull(),
  status: text("status").default("pendente"),
  pagamentoStatus: text("pagamentoStatus").default("pendente"),
  contratoUrl: text("contratoUrl"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
});


/**
 * ========================================
 * TABELA DE HISTÓRICO DE RESERVAS
 * ========================================
 */
export const reservaHistorico = sqliteTable("reserva_historico", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservaId: integer("reservaId").notNull(),
  userId: text("userId").notNull(), // Quem fez a ação
  acao: text("acao").notNull(), // 'criada', 'aprovada', 'rejeitada', 'cancelada'
  detalhes: text("detalhes"), // Informações adicionais (ex: motivo de rejeição)
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export type ReservaHistorico = typeof reservaHistorico.$inferSelect;
export type InsertReservaHistorico = typeof reservaHistorico.$inferInsert;

// Tabela de avaliações
export const avaliacoes = sqliteTable("avaliacoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siloId: integer("siloId").notNull(),
  userId: text("userId").notNull(),
  reservaId: integer("reservaId").notNull(),
  nota: integer("nota").notNull(), // 1 a 5 estrelas
  comentario: text("comentario"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Avaliacao = typeof avaliacoes.$inferSelect;
export type InsertAvaliacao = typeof avaliacoes.$inferInsert;

// Tabela de conversas
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user1Id: text("user1Id").notNull(),
  user2Id: text("user2Id").notNull(),
  lastMessageAt: integer("lastMessageAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Tabela de mensagens
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversationId").notNull(),
  senderId: text("senderId").notNull(),
  receiverId: text("receiverId").notNull(),
  content: text("content").notNull(),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Tabela de pagamentos
export const pagamentos = sqliteTable("pagamentos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservaId: integer("reservaId").notNull(),
  userId: text("userId").notNull(),
  valor: real("valor").notNull(),
  status: text("status").notNull(), // pending, paid, failed, refunded
  stripeSessionId: text("stripeSessionId"),
  stripePaymentIntentId: text("stripePaymentIntentId"),
  metadata: text("metadata"), // JSON com informações adicionais
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  paidAt: integer("paidAt", { mode: "timestamp" }),
});

export type Pagamento = typeof pagamentos.$inferSelect;
export type InsertPagamento = typeof pagamentos.$inferInsert;

// Tabela de contratos
export const contratos = sqliteTable("contratos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservaId: integer("reservaId").notNull(),
  proprietarioId: text("proprietarioId").notNull(),
  produtorId: text("produtorId").notNull(),
  conteudo: text("conteudo").notNull(), // HTML do contrato
  status: text("status").notNull(), // pending, signed_by_producer, signed_by_owner, completed
  assinaturaProdutor: text("assinaturaProdutor"), // IP + timestamp
  assinaturaProprietario: text("assinaturaProprietario"), // IP + timestamp
  pdfUrl: text("pdfUrl"), // URL do PDF gerado
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  signedAt: integer("signedAt", { mode: "timestamp" }),
});

export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;
