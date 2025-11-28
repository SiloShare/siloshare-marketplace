import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Atualizar perfil do usuário
 */
export async function updateProfile(userId: string, data: {
  name?: string;
  telefone?: string;
  avatarUrl?: string;
}) {
  try {
    await db
      .update(users)
      .set({
        ...data,
      })
      .where(eq(users.id, userId));

    // Buscar usuário atualizado
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return updatedUser;
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw error;
  }
}

/**
 * Alterar senha do usuário
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Buscar usuário
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.password) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return { success: true, message: 'Senha alterada com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    throw error;
  }
}
