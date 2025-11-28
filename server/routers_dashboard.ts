import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, reservas } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Buscar estatísticas do dashboard do proprietário
 */
export async function getDashboardStats(userId: string) {
  try {
    // Buscar todos os silos do proprietário
    const userSilos = await db
      .select()
      .from(silos)
      .where(eq(silos.userId, userId));

    if (userSilos.length === 0) {
      return {
        totalSilos: 0,
        totalReservas: 0,
        reservasPendentes: 0,
        capacidadeTotal: 0,
        capacidadeDisponivel: 0,
        taxaOcupacao: 0,
        receitaTotal: 0,
        receitaMesAtual: 0,
        reservasPorStatus: {
          pendente: 0,
          confirmada: 0,
          cancelada: 0,
          rejeitada: 0,
        },
        ultimasReservas: [],
      };
    }

    const siloIds = userSilos.map(s => s.id);

    // Buscar todas as reservas dos silos
    const todasReservas = await db
      .select()
      .from(reservas)
      .where(sql`${reservas.siloId} IN ${siloIds}`);

    // Calcular estatísticas
    const totalSilos = userSilos.length;
    const totalReservas = todasReservas.length;
    const reservasPendentes = todasReservas.filter(r => r.status === 'pendente').length;

    // Capacidade total e disponível
    const capacidadeTotal = userSilos.reduce((sum, s) => sum + (s.capacidadeTotal || 0), 0);
    const capacidadeDisponivel = userSilos.reduce((sum, s) => sum + (s.capacidadeDisponivel || 0), 0);
    const taxaOcupacao = capacidadeTotal > 0 
      ? ((capacidadeTotal - capacidadeDisponivel) / capacidadeTotal) * 100 
      : 0;

    // Receita total e do mês atual
    const receitaTotal = todasReservas
      .filter(r => r.status === 'confirmada')
      .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

    const mesAtual = new Date();
    mesAtual.setDate(1);
    mesAtual.setHours(0, 0, 0, 0);

    const receitaMesAtual = todasReservas
      .filter(r => 
        r.status === 'confirmada' && 
        r.createdAt && 
        new Date(r.createdAt) >= mesAtual
      )
      .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

    // Reservas por status
    const reservasPorStatus = {
      pendente: todasReservas.filter(r => r.status === 'pendente').length,
      confirmada: todasReservas.filter(r => r.status === 'confirmada').length,
      cancelada: todasReservas.filter(r => r.status === 'cancelada').length,
      rejeitada: todasReservas.filter(r => r.status === 'rejeitada').length,
    };

    // Últimas 5 reservas
    const ultimasReservas = todasReservas
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      totalSilos,
      totalReservas,
      reservasPendentes,
      capacidadeTotal,
      capacidadeDisponivel,
      taxaOcupacao: Math.round(taxaOcupacao * 10) / 10,
      receitaTotal,
      receitaMesAtual,
      reservasPorStatus,
      ultimasReservas,
      silos: userSilos,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do dashboard:', error);
    throw error;
  }
}
