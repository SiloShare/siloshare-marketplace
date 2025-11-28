import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, reservas, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

type ReportFormat = "csv" | "json";

/**
 * Gerar relatório de reservas do proprietário
 */
export async function generateReservasReport(
  userId: string,
  format: ReportFormat = "csv"
): Promise<{ content: string; filename: string; mimeType: string }> {
  try {
    // Buscar silos do proprietário
    const userSilos = await db.select().from(silos).where(eq(silos.userId, userId));

    if (userSilos.length === 0) {
      throw new Error("Nenhum silo encontrado");
    }

    const siloIds = userSilos.map((s) => s.id);

    // Buscar reservas com informações do produtor
    const reservasData = await db
      .select({
        reservaId: reservas.id,
        siloId: reservas.siloId,
        siloNome: silos.nome,
        produtorId: reservas.produtorId,
        produtorNome: users.name,
        produtorEmail: users.email,
        capacidade: reservas.capacidade,
        dataInicio: reservas.dataInicio,
        dataFim: reservas.dataFim,
        valorTotal: reservas.valorTotal,
        status: reservas.status,
        createdAt: reservas.createdAt,
      })
      .from(reservas)
      .leftJoin(silos, eq(reservas.siloId, silos.id))
      .leftJoin(users, eq(reservas.produtorId, users.id))
      .where(sql`${reservas.siloId} IN ${siloIds}`)
      .orderBy(sql`${reservas.createdAt} DESC`);

    if (format === "csv") {
      return generateCSV(reservasData);
    } else {
      return generateJSON(reservasData);
    }
  } catch (error) {
    console.error("❌ Erro ao gerar relatório:", error);
    throw error;
  }
}

/**
 * Gerar relatório em formato CSV
 */
function generateCSV(data: any[]): { content: string; filename: string; mimeType: string } {
  const headers = [
    "ID Reserva",
    "Silo",
    "Produtor",
    "E-mail Produtor",
    "Capacidade (ton)",
    "Data Início",
    "Data Fim",
    "Valor Total (R$)",
    "Status",
    "Data Criação",
  ];

  const rows = data.map((r) => [
    r.reservaId,
    r.siloNome || `Silo #${r.siloId}`,
    r.produtorNome || "Desconhecido",
    r.produtorEmail || "N/A",
    r.capacidade || 0,
    r.dataInicio ? format(new Date(r.dataInicio), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
    r.dataFim ? format(new Date(r.dataFim), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
    r.valorTotal || 0,
    r.status || "N/A",
    r.createdAt ? format(new Date(r.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "N/A",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escapar células que contêm vírgulas ou aspas
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  const filename = `relatorio-reservas-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;

  return {
    content: csvContent,
    filename,
    mimeType: "text/csv",
  };
}

/**
 * Gerar relatório em formato JSON
 */
function generateJSON(data: any[]): { content: string; filename: string; mimeType: string } {
  const jsonContent = JSON.stringify(
    {
      gerado_em: new Date().toISOString(),
      total_reservas: data.length,
      reservas: data.map((r) => ({
        id: r.reservaId,
        silo: {
          id: r.siloId,
          nome: r.siloNome,
        },
        produtor: {
          id: r.produtorId,
          nome: r.produtorNome,
          email: r.produtorEmail,
        },
        capacidade_toneladas: r.capacidade,
        periodo: {
          inicio: r.dataInicio,
          fim: r.dataFim,
        },
        valor_total_brl: r.valorTotal,
        status: r.status,
        criado_em: r.createdAt,
      })),
    },
    null,
    2
  );

  const filename = `relatorio-reservas-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;

  return {
    content: jsonContent,
    filename,
    mimeType: "application/json",
  };
}

/**
 * Gerar relatório de silos do proprietário
 */
export async function generateSilosReport(
  userId: string,
  format: ReportFormat = "csv"
): Promise<{ content: string; filename: string; mimeType: string }> {
  try {
    const userSilos = await db.select().from(silos).where(eq(silos.userId, userId));

    if (userSilos.length === 0) {
      throw new Error("Nenhum silo encontrado");
    }

    if (format === "csv") {
      const headers = [
        "ID",
        "Nome",
        "Tipo de Grão",
        "Capacidade Total (ton)",
        "Capacidade Disponível (ton)",
        "Ocupação (%)",
        "Preço/ton (R$)",
        "Cidade",
        "Estado",
        "Status",
      ];

      const rows = userSilos.map((s) => {
        const ocupacao =
          s.capacidadeTotal && s.capacidadeTotal > 0
            ? (((s.capacidadeTotal - (s.capacidadeDisponivel || 0)) / s.capacidadeTotal) * 100).toFixed(1)
            : "0";

        return [
          s.id,
          s.nome || "N/A",
          s.tipoGrao || "N/A",
          s.capacidadeTotal || 0,
          s.capacidadeDisponivel || 0,
          ocupacao,
          s.precoPorTonelada || 0,
          s.cidade || "N/A",
          s.estado || "N/A",
          s.disponivel ? "Ativo" : "Inativo",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              const cellStr = String(cell);
              if (cellStr.includes(",") || cellStr.includes('"')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        ),
      ].join("\n");

      const filename = `relatorio-silos-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;

      return {
        content: csvContent,
        filename,
        mimeType: "text/csv",
      };
    } else {
      const jsonContent = JSON.stringify(
        {
          gerado_em: new Date().toISOString(),
          total_silos: userSilos.length,
          silos: userSilos,
        },
        null,
        2
      );

      const filename = `relatorio-silos-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;

      return {
        content: jsonContent,
        filename,
        mimeType: "application/json",
      };
    }
  } catch (error) {
    console.error("❌ Erro ao gerar relatório de silos:", error);
    throw error;
  }
}
