import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { reservaHistorico } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Registrar uma ação no histórico da reserva
 */
export async function registrarAcao(
  reservaId: number,
  userId: string,
  acao: 'criada' | 'aprovada' | 'rejeitada' | 'cancelada',
  detalhes?: string
) {
  try {
    await db.insert(reservaHistorico).values({
      reservaId,
      userId,
      acao,
      detalhes: detalhes || null,
      createdAt: new Date(),
    });
    
    console.log(`📝 Histórico registrado: Reserva #${reservaId} - ${acao} por ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao registrar histórico:', error);
    return { success: false, error };
  }
}

/**
 * Buscar histórico de uma reserva
 */
export async function buscarHistorico(reservaId: number) {
  try {
    const historico = await db
      .select()
      .from(reservaHistorico)
      .where(eq(reservaHistorico.reservaId, reservaId))
      .orderBy(reservaHistorico.createdAt);
    
    // Ordenar por data (mais recente primeiro)
    return historico.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    return [];
  }
}
