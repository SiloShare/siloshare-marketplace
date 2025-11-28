import { db } from "../db";
import { users, verificationCodes } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Gera um código de verificação de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Cria um código de verificação para um usuário
 */
export async function createVerificationCode(
  userId: string,
  type: "email" | "sms"
): Promise<string> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  await db.insert(verificationCodes).values({
    userId,
    code,
    type,
    expiresAt,
    used: false,
  });

  return code;
}

/**
 * Verifica um código de verificação
 */
export async function verifyCode(
  userId: string,
  code: string,
  type: "email" | "sms"
): Promise<boolean> {
  const [verificationCode] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, type),
        eq(verificationCodes.used, false)
      )
    )
    .limit(1);

  if (!verificationCode) {
    return false;
  }

  // Verifica se o código expirou
  if (new Date() > verificationCode.expiresAt) {
    return false;
  }

  // Marca o código como usado
  await db
    .update(verificationCodes)
    .set({ used: true })
    .where(eq(verificationCodes.id, verificationCode.id));

  // Atualiza o status de verificação do usuário
  if (type === "email") {
    await db
      .update(users)
      .set({ emailVerificado: true, verificado: true })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({ celularVerificado: true, verificado: true })
      .where(eq(users.id, userId));
  }

  return true;
}

/**
 * Cria ou atualiza um usuário
 */
export async function upsertUser(userData: {
  id: string;
  email?: string;
  name?: string;
  telefone?: string;
  cpfCnpj?: string;
  tipoUsuario?: "produtor" | "dono_silo" | "transportadora";
}) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userData.id))
    .limit(1);

  if (existingUser.length > 0) {
    // Atualiza usuário existente
    await db
      .update(users)
      .set({
        ...userData,
        lastSignedIn: new Date(),
      })
      .where(eq(users.id, userData.id));
  } else {
    // Cria novo usuário
    await db.insert(users).values({
      ...userData,
      role: "user",
      verificado: false,
      emailVerificado: false,
      celularVerificado: false,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    });
  }

  return await db
    .select()
    .from(users)
    .where(eq(users.id, userData.id))
    .limit(1)
    .then((rows) => rows[0]);
}

/**
 * Busca usuário por ID
 */
export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user || null;
}

