import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { avaliacoes, silos, users, reservas } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Criar avaliação de um silo
 */
export async function createAvaliacao(data: {
  siloId: number;
  userId: string;
  reservaId: number;
  nota: number;
  comentario?: string;
}) {
  try {
    // Verificar se o usuário tem uma reserva confirmada neste silo
    const [reserva] = await db
      .select()
      .from(reservas)
      .where(
        and(
          eq(reservas.id, data.reservaId),
          eq(reservas.produtorId, data.userId),
          eq(reservas.siloId, data.siloId),
          eq(reservas.status, 'confirmada')
        )
      );

    if (!reserva) {
      throw new Error('Você precisa ter uma reserva confirmada para avaliar este silo');
    }

    // Verificar se já existe avaliação para esta reserva
    const [existingAvaliacao] = await db
      .select()
      .from(avaliacoes)
      .where(eq(avaliacoes.reservaId, data.reservaId));

    if (existingAvaliacao) {
      throw new Error('Você já avaliou esta reserva');
    }

    // Criar avaliação
    const [avaliacao] = await db
      .insert(avaliacoes)
      .values({
        siloId: data.siloId,
        userId: data.userId,
        reservaId: data.reservaId,
        nota: data.nota,
        comentario: data.comentario,
      })
      .returning();

    // Atualizar média de avaliações do silo
    await updateSiloRating(data.siloId);

    return avaliacao;
  } catch (error) {
    console.error('❌ Erro ao criar avaliação:', error);
    throw error;
  }
}

/**
 * Buscar avaliações de um silo
 */
export async function getAvaliacoesBySilo(siloId: number) {
  try {
    const avaliacoesComUsuarios = await db
      .select({
        id: avaliacoes.id,
        siloId: avaliacoes.siloId,
        userId: avaliacoes.userId,
        reservaId: avaliacoes.reservaId,
        nota: avaliacoes.nota,
        comentario: avaliacoes.comentario,
        createdAt: avaliacoes.createdAt,
        userName: users.name,
        userAvatarUrl: users.avatarUrl,
      })
      .from(avaliacoes)
      .leftJoin(users, eq(avaliacoes.userId, users.id))
      .where(eq(avaliacoes.siloId, siloId))
      .orderBy(sql`${avaliacoes.createdAt} DESC`);

    return avaliacoesComUsuarios;
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações:', error);
    throw error;
  }
}

/**
 * Verificar se o usuário pode avaliar um silo
 */
export async function canUserReview(userId: string, siloId: number) {
  try {
    // Buscar reservas confirmadas do usuário neste silo
    const reservasConfirmadas = await db
      .select()
      .from(reservas)
      .where(
        and(
          eq(reservas.produtorId, userId),
          eq(reservas.siloId, siloId),
          eq(reservas.status, 'confirmada')
        )
      );

    if (reservasConfirmadas.length === 0) {
      return { canReview: false, reason: 'Você precisa ter uma reserva confirmada para avaliar' };
    }

    // Verificar se já avaliou todas as reservas
    for (const reserva of reservasConfirmadas) {
      const [avaliacao] = await db
        .select()
        .from(avaliacoes)
        .where(eq(avaliacoes.reservaId, reserva.id));

      if (!avaliacao) {
        return { 
          canReview: true, 
          reservaId: reserva.id,
          reason: 'Você pode avaliar este silo' 
        };
      }
    }

    return { canReview: false, reason: 'Você já avaliou todas as suas reservas neste silo' };
  } catch (error) {
    console.error('❌ Erro ao verificar se pode avaliar:', error);
    throw error;
  }
}

/**
 * Atualizar média de avaliações do silo
 */
async function updateSiloRating(siloId: number) {
  try {
    // Buscar todas as avaliações do silo
    const siloAvaliacoes = await db
      .select()
      .from(avaliacoes)
      .where(eq(avaliacoes.siloId, siloId));

    if (siloAvaliacoes.length === 0) {
      return;
    }

    // Calcular média
    const soma = siloAvaliacoes.reduce((acc, av) => acc + av.nota, 0);
    const media = soma / siloAvaliacoes.length;

    // Atualizar silo
    await db
      .update(silos)
      .set({
        avaliacaoMedia: media,
        totalAvaliacoes: siloAvaliacoes.length,
      })
      .where(eq(silos.id, siloId));

    console.log(`✅ Média de avaliações do silo ${siloId} atualizada: ${media.toFixed(1)} (${siloAvaliacoes.length} avaliações)`);
  } catch (error) {
    console.error('❌ Erro ao atualizar média de avaliações:', error);
    throw error;
  }
}
