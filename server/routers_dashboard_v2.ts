import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, reservas } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

type PeriodFilter = "current_month" | "last_3_months" | "last_6_months" | "last_year" | "all_time";

/**
 * Calcular comparação com período anterior
 */
async function calculatePeriodComparison(
  todasReservas: any[],
  period: PeriodFilter,
  currentStartDate: Date | null,
  currentEndDate: Date
) {
  if (period === "all_time" || !currentStartDate) {
    return null; // Não há comparação para "todo o período"
  }

  // Calcular datas do período anterior
  const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();
  const previousEndDate = new Date(currentStartDate.getTime() - 1); // 1ms antes do início atual
  const previousStartDate = new Date(previousEndDate.getTime() - periodDuration);

  // Filtrar reservas do período atual
  const currentReservas = todasReservas.filter(
    (r) =>
      r.createdAt &&
      new Date(r.createdAt) >= currentStartDate &&
      new Date(r.createdAt) <= currentEndDate
  );

  // Filtrar reservas do período anterior
  const previousReservas = todasReservas.filter(
    (r) =>
      r.createdAt &&
      new Date(r.createdAt) >= previousStartDate &&
      new Date(r.createdAt) <= previousEndDate
  );

  // Calcular métricas do período atual
  const currentReceita = currentReservas
    .filter((r) => r.status === "confirmada")
    .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

  const currentTotal = currentReservas.length;

  // Calcular métricas do período anterior
  const previousReceita = previousReservas
    .filter((r) => r.status === "confirmada")
    .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

  const previousTotal = previousReservas.length;

  // Calcular variações percentuais
  const receitaChange =
    previousReceita > 0 ? ((currentReceita - previousReceita) / previousReceita) * 100 : 0;

  const reservasChange =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return {
    receita: {
      current: currentReceita,
      previous: previousReceita,
      change: Math.round(receitaChange * 10) / 10,
      isPositive: receitaChange >= 0,
    },
    reservas: {
      current: currentTotal,
      previous: previousTotal,
      change: Math.round(reservasChange * 10) / 10,
      isPositive: reservasChange >= 0,
    },
  };
}

/**
 * Calcular datas de início e fim baseado no filtro de período
 */
function getPeriodDates(period: PeriodFilter): { startDate: Date | null; endDate: Date } {
  const now = new Date();
  const endDate = now;
  let startDate: Date | null = null;

  switch (period) {
    case "current_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_3_months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case "last_6_months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case "last_year":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      break;
    case "all_time":
      startDate = null; // Sem filtro de data
      break;
  }

  return { startDate, endDate };
}

/**
 * Gerar alertas inteligentes baseados em métricas dos silos
 */
function generateIntelligentAlerts(silos: any[], reservas: any[]) {
  const alerts: Array<{
    type: "warning" | "info" | "success";
    title: string;
    message: string;
    siloId?: number;
    siloNome?: string;
  }> = [];

  // Alerta 1: Silos com baixa ocupação (<30%)
  const silosBaixaOcupacao = silos.filter((silo) => {
    if (!silo.capacidadeTotal || silo.capacidadeTotal === 0) return false;
    const ocupacao =
      ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100;
    return ocupacao < 30;
  });

  if (silosBaixaOcupacao.length > 0) {
    silosBaixaOcupacao.forEach((silo) => {
      const ocupacao =
        ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100;
      alerts.push({
        type: "warning",
        title: "Baixa Ocupação",
        message: `${silo.nome} está com apenas ${ocupacao.toFixed(1)}% de ocupação. Considere ações de marketing.`,
        siloId: silo.id,
        siloNome: silo.nome,
      });
    });
  }

  // Alerta 2: Silos com alta ocupação (>90%)
  const silosAltaOcupacao = silos.filter((silo) => {
    if (!silo.capacidadeTotal || silo.capacidadeTotal === 0) return false;
    const ocupacao =
      ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100;
    return ocupacao > 90;
  });

  if (silosAltaOcupacao.length > 0) {
    silosAltaOcupacao.forEach((silo) => {
      const ocupacao =
        ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100;
      alerts.push({
        type: "info",
        title: "Alta Ocupação",
        message: `${silo.nome} está com ${ocupacao.toFixed(1)}% de ocupação. Capacidade quase esgotada!`,
        siloId: silo.id,
        siloNome: silo.nome,
      });
    });
  }

  // Alerta 3: Reservas pendentes há mais de 7 dias
  const reservasPendentesAntigas = reservas.filter((r) => {
    if (r.status !== "pendente" || !r.createdAt) return false;
    const diasPendente = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diasPendente > 7;
  });

  if (reservasPendentesAntigas.length > 0) {
    alerts.push({
      type: "warning",
      title: "Reservas Pendentes",
      message: `Você tem ${reservasPendentesAntigas.length} reserva(s) pendente(s) há mais de 7 dias. Revise e responda!`,
    });
  }

  // Alerta 4: Silos sem reservas nos últimos 30 dias
  const diasSemReserva = 30;
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - diasSemReserva);

  const silosSemReservas = silos.filter((silo) => {
    const reservasSilo = reservas.filter(
      (r) => r.siloId === silo.id && r.createdAt && new Date(r.createdAt) >= dataLimite
    );
    return reservasSilo.length === 0;
  });

  if (silosSemReservas.length > 0 && silosSemReservas.length < silos.length) {
    // Só alerta se não for TODOS os silos
    silosSemReservas.slice(0, 3).forEach((silo) => {
      // Limitar a 3 alertas
      alerts.push({
        type: "info",
        title: "Sem Reservas Recentes",
        message: `${silo.nome} não recebeu reservas nos últimos ${diasSemReserva} dias.`,
        siloId: silo.id,
        siloNome: silo.nome,
      });
    });
  }

  // Alerta 5: Sucesso - Boa taxa de aprovação
  const totalReservas = reservas.length;
  if (totalReservas >= 10) {
    const aprovadas = reservas.filter((r) => r.status === "confirmada").length;
    const taxaAprovacao = (aprovadas / totalReservas) * 100;

    if (taxaAprovacao >= 80) {
      alerts.push({
        type: "success",
        title: "Ótima Taxa de Aprovação!",
        message: `Você aprovou ${taxaAprovacao.toFixed(1)}% das reservas. Continue assim!`,
      });
    }
  }

  return alerts;
}

/**
 * Buscar estatísticas do dashboard do proprietário com filtro de período
 */
export async function getDashboardStatsV2(
  userId: string,
  period: PeriodFilter = "current_month",
  siloId?: number
) {
  try {
    // Buscar silos do proprietário (todos ou apenas um específico)
    const userSilos = siloId
      ? await db
          .select()
          .from(silos)
          .where(and(eq(silos.userId, userId), eq(silos.id, siloId)))
      : await db
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
        statusDistribution: {
          pendente: 0,
          confirmada: 0,
          cancelada: 0,
          rejeitada: 0,
        },
        ultimasReservas: [],
        silosOcupacao: [],
        receitaMensal: [],
      };
    }

    const siloIds = userSilos.map((s) => s.id);

    // Calcular período
    const { startDate, endDate } = getPeriodDates(period);

    // Buscar todas as reservas dos silos (sem filtro de data para algumas métricas)
    const todasReservas = await db
      .select()
      .from(reservas)
      .where(sql`${reservas.siloId} IN ${siloIds}`);

    // Filtrar reservas por período (para métricas específicas)
    const reservasPeriodo = startDate
      ? todasReservas.filter(
          (r) => r.createdAt && new Date(r.createdAt) >= startDate && new Date(r.createdAt) <= endDate
        )
      : todasReservas;

    // Calcular estatísticas
    const totalSilos = userSilos.length;
    const totalReservas = reservasPeriodo.length;
    const reservasPendentes = todasReservas.filter((r) => r.status === "pendente").length;

    // Capacidade total e disponível (sempre atual, não filtrado por período)
    const capacidadeTotal = userSilos.reduce((sum, s) => sum + (s.capacidadeTotal || 0), 0);
    const capacidadeDisponivel = userSilos.reduce(
      (sum, s) => sum + (s.capacidadeDisponivel || 0),
      0
    );
    const taxaOcupacao =
      capacidadeTotal > 0 ? ((capacidadeTotal - capacidadeDisponivel) / capacidadeTotal) * 100 : 0;

    // Receita total do período
    const receitaTotal = reservasPeriodo
      .filter((r) => r.status === "confirmada")
      .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

    // Receita do mês atual
    const mesAtual = new Date();
    mesAtual.setDate(1);
    mesAtual.setHours(0, 0, 0, 0);

    const receitaMesAtual = todasReservas
      .filter(
        (r) => r.status === "confirmada" && r.createdAt && new Date(r.createdAt) >= mesAtual
      )
      .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

    // Distribuição por status (do período)
    const statusDistribution = {
      pendente: reservasPeriodo.filter((r) => r.status === "pendente").length,
      confirmada: reservasPeriodo.filter((r) => r.status === "confirmada").length,
      cancelada: reservasPeriodo.filter((r) => r.status === "cancelada").length,
      rejeitada: reservasPeriodo.filter((r) => r.status === "rejeitada").length,
    };

    // Últimas 5 reservas (sempre as mais recentes, independente do período)
    const ultimasReservas = todasReservas
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((r) => {
        const silo = userSilos.find((s) => s.id === r.siloId);
        return {
          ...r,
          siloNome: silo?.nome || `Silo #${r.siloId}`,
        };
      });

    // Ocupação por silo
    const silosOcupacao = userSilos.map((silo) => ({
      id: silo.id,
      nome: silo.nome,
      capacidadeTotal: silo.capacidadeTotal || 0,
      capacidadeDisponivel: silo.capacidadeDisponivel || 0,
      ocupacao:
        silo.capacidadeTotal && silo.capacidadeTotal > 0
          ? ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100
          : 0,
    }));

    // Receita mensal (últimos 6 meses) + projeção (próximos 3 meses)
    const receitaMensal = [];
    const receitaHistorica = [];
    for (let i = 5; i >= 0; i--) {
      const mesInicio = new Date();
      mesInicio.setMonth(mesInicio.getMonth() - i);
      mesInicio.setDate(1);
      mesInicio.setHours(0, 0, 0, 0);

      const mesFim = new Date(mesInicio);
      mesFim.setMonth(mesFim.getMonth() + 1);
      mesFim.setDate(0);
      mesFim.setHours(23, 59, 59, 999);

      const receita = todasReservas
        .filter(
          (r) =>
            r.status === "confirmada" &&
            r.createdAt &&
            new Date(r.createdAt) >= mesInicio &&
            new Date(r.createdAt) <= mesFim
        )
        .reduce((sum, r) => sum + (r.valorTotal || 0), 0);

      const monthData = {
        month: mesInicio.toLocaleDateString("pt-BR", { month: "short" }),
        receita,
      };
      receitaMensal.push(monthData);
      receitaHistorica.push(receita);
    }

    // Calcular projeção de receita (média dos últimos 3 meses)
    const ultimos3Meses = receitaHistorica.slice(-3);
    const mediaReceita = ultimos3Meses.reduce((sum, r) => sum + r, 0) / ultimos3Meses.length;
    
    // Adicionar projeção para os próximos 3 meses
    for (let i = 1; i <= 3; i++) {
      const mesFuturo = new Date();
      mesFuturo.setMonth(mesFuturo.getMonth() + i);
      receitaMensal.push({
        month: mesFuturo.toLocaleDateString("pt-BR", { month: "short" }),
        receita: Math.round(mediaReceita), // Projeção baseada na média
        isProjection: true,
      });
    }

    // Calcular comparação com período anterior
    const periodComparison = await calculatePeriodComparison(
      todasReservas,
      period,
      startDate,
      endDate
    );

    // Gerar alertas inteligentes
    const alerts = generateIntelligentAlerts(userSilos, todasReservas);

    return {
      totalSilos,
      totalReservas,
      reservasPendentes,
      capacidadeTotal,
      capacidadeDisponivel,
      taxaOcupacao: Math.round(taxaOcupacao * 10) / 10,
      receitaTotal,
      receitaMesAtual,
      statusDistribution,
      ultimasReservas,
      silosOcupacao,
      receitaMensal,
      period,
      periodComparison,
      alerts,
      silos: userSilos, // Lista de silos para o dropdown
    };
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas do dashboard:", error);
    throw error;
  }
}
