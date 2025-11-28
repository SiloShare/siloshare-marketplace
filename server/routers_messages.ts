import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { conversations, messages, users } from "../drizzle/schema";
import { eq, and, or, sql, desc } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Buscar ou criar conversa entre dois usuários
 */
export async function getOrCreateConversation(user1Id: string, user2Id: string) {
  try {
    // Buscar conversa existente (em qualquer ordem)
    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.user1Id, user1Id),
            eq(conversations.user2Id, user2Id)
          ),
          and(
            eq(conversations.user1Id, user2Id),
            eq(conversations.user2Id, user1Id)
          )
        )
      );

    if (existingConversation) {
      return existingConversation;
    }

    // Criar nova conversa
    const [newConversation] = await db
      .insert(conversations)
      .values({
        user1Id,
        user2Id,
      })
      .returning();

    return newConversation;
  } catch (error) {
    console.error('❌ Erro ao buscar/criar conversa:', error);
    throw error;
  }
}

/**
 * Listar conversas do usuário
 */
export async function getUserConversations(userId: string) {
  try {
    const userConversations = await db
      .select({
        id: conversations.id,
        user1Id: conversations.user1Id,
        user2Id: conversations.user2Id,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Para cada conversa, buscar informações do outro usuário e última mensagem
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        const otherUserId = conversation.user1Id === userId 
          ? conversation.user2Id 
          : conversation.user1Id;

        // Buscar informações do outro usuário
        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, otherUserId));

        // Buscar última mensagem
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Contar mensagens não lidas
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.receiverId, userId),
              eq(messages.read, false)
            )
          );

        return {
          ...conversation,
          otherUser,
          lastMessage,
          unreadCount: Number(unreadCount[0]?.count || 0),
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error('❌ Erro ao listar conversas:', error);
    throw error;
  }
}

/**
 * Buscar mensagens de uma conversa
 */
export async function getConversationMessages(conversationId: number, userId: string) {
  try {
    // Verificar se o usuário faz parte da conversa
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      throw new Error('Conversa não encontrada');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new Error('Você não tem permissão para acessar esta conversa');
    }

    // Buscar mensagens
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return conversationMessages;
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    throw error;
  }
}

/**
 * Enviar mensagem
 */
export async function sendMessage(data: {
  conversationId: number;
  senderId: string;
  receiverId: string;
  content: string;
}) {
  try {
    // Verificar se o sender faz parte da conversa
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, data.conversationId));

    if (!conversation) {
      throw new Error('Conversa não encontrada');
    }

    if (conversation.user1Id !== data.senderId && conversation.user2Id !== data.senderId) {
      throw new Error('Você não tem permissão para enviar mensagens nesta conversa');
    }

    // Criar mensagem
    const [message] = await db
      .insert(messages)
      .values({
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
      })
      .returning();

    // Atualizar lastMessageAt da conversa
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, data.conversationId));

    return message;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }
}

/**
 * Marcar mensagens como lidas
 */
export async function markMessagesAsRead(conversationId: number, userId: string) {
  try {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao marcar mensagens como lidas:', error);
    throw error;
  }
}

/**
 * Contar mensagens não lidas do usuário
 */
export async function getUnreadCount(userId: string) {
  try {
    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );

    return Number(unreadCount[0]?.count || 0);
  } catch (error) {
    console.error('❌ Erro ao contar mensagens não lidas:', error);
    throw error;
  }
}
