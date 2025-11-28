import { eq, and, gte, lte, desc, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  InsertUser,
  User,
  users,
  silos,
  InsertSilo,
  Silo,
  reservas,
  verificationCodes,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = createClient({
        url: process.env.DATABASE_URL,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    
    if (existing.length > 0) {
      // Update existing user
      const updateData: Partial<InsertUser> = {};
      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.password !== undefined) updateData.password = user.password;
      if (user.telefone !== undefined) updateData.telefone = user.telefone;
      if (user.cpfCnpj !== undefined) updateData.cpfCnpj = user.cpfCnpj;
      if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
      if (user.role !== undefined) updateData.role = user.role;
      if (user.tipoUsuario !== undefined) updateData.tipoUsuario = user.tipoUsuario;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;
      
      await db.update(users).set(updateData).where(eq(users.id, user.id));
    } else {
      // Insert new user
      await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ========================================
 * FUNÇÕES DE SILOS
 * ========================================
 */

export async function createSilo(silo: InsertSilo): Promise<Silo> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(silos).values({
    ...silo,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // SQLite retorna o lastInsertRowid
  const insertedId = Number(result.lastInsertRowid);
  const inserted = await db.select().from(silos).where(eq(silos.id, insertedId)).limit(1);
  
  return inserted[0];
}

export async function getSilos(filters?: {
  cidade?: string;
  estado?: string;
  disponivel?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Silo[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(silos);

  const conditions = [];
  if (filters?.cidade) {
    conditions.push(eq(silos.cidade, filters.cidade));
  }
  if (filters?.estado) {
    conditions.push(eq(silos.estado, filters.estado));
  }
  if (filters?.disponivel !== undefined) {
    conditions.push(eq(silos.disponivel, filters.disponivel ? 1 : 0));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(silos.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getSiloById(id: number): Promise<Silo | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(silos).where(eq(silos.id, id)).limit(1);
  return result[0];
}

export async function getSilosByUserId(userId: string): Promise<Silo[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(silos).where(eq(silos.userId, userId)).orderBy(desc(silos.createdAt));
}

export async function updateSilo(id: number, updates: Partial<InsertSilo>): Promise<Silo | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(silos).set({ ...updates, updatedAt: new Date() }).where(eq(silos.id, id));
  return await getSiloById(id);
}

export async function deleteSilo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(silos).where(eq(silos.id, id));
}

/**
 * ========================================
 * FUNÇÕES DE CÓDIGOS DE VERIFICAÇÃO
 * ========================================
 */

export async function createVerificationCode(data: {
  userId: string;
  code: string;
  type: string;
  expiresAt: Date;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(verificationCodes).values({
    ...data,
    createdAt: new Date(),
  });
}

export async function getVerificationCode(userId: string, code: string): Promise<any> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(verificationCodes)
    .where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.code, code)))
    .limit(1);

  return result[0];
}

export async function markVerificationCodeAsUsed(userId: string, code: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(verificationCodes)
    .set({ used: 1 })
    .where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.code, code)));
}

export async function saveVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void> {
  await createVerificationCode({
    userId,
    code,
    type: "email",
    expiresAt,
  });
}

/**
 * Verificar código de verificação
 */
export async function verificarCodigo(
  userId: string,
  tipo: "email" | "sms",
  code: string
): Promise<{ success: boolean; message?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar código mais recente não usado
  const codes = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.type, tipo),
        eq(verificationCodes.used, 0)
      )
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (!codes || codes.length === 0) {
    return { success: false, message: "Código não encontrado" };
  }

  const codeRecord = codes[0];

  // Verificar se expirou
  if (new Date() > new Date(codeRecord.expiresAt)) {
    return { success: false, message: "Código expirado. Solicite um novo código." };
  }

  // Verificar se código está correto
  if (codeRecord.code !== code) {
    return { success: false, message: "Código inválido" };
  }

  // Marcar código como usado
  await db
    .update(verificationCodes)
    .set({ used: 1 })
    .where(eq(verificationCodes.id, codeRecord.id));

  // Atualizar status de verificação do usuário
  await db
    .update(users)
    .set({ 
      emailVerificado: 1,
      verificado: 1
    })
    .where(eq(users.id, userId));

  console.log(`[Verification] E-mail verificado para userId: ${userId}`);
  return { success: true };
}

/**
 * Reenviar código de verificação
 */
export async function resendVerificationCode(
  userId: string
): Promise<{ success: boolean; code?: string; message?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuário
  const user = await getUser(userId);
  if (!user) {
    return { success: false, message: "Usuário não encontrado" };
  }

  // Verificar se já está verificado
  if (user.emailVerificado) {
    return { success: false, message: "E-mail já verificado" };
  }

  // Gerar novo código
  const { generateVerificationCode } = await import("./services/emailService");
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  // Salvar código
  await saveVerificationCode(userId, code, expiresAt);

  console.log(`[Verification] Novo código gerado para userId: ${userId}`);
  return { success: true, code };
}
