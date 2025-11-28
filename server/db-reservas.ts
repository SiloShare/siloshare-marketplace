import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { reservas, silos, users } from "../drizzle/schema";
import { eq, and, or, gte, lte } from "drizzle-orm";
import * as emailService from "./services/emailService";
import * as historicoService from "./services/reservaHistoricoService";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

export async function createReserva(data: {
  siloId: number;
  produtorId: string;
  capacidadeReservada: number;
  dataInicio: Date;
  dataFim: Date;
  valorTotal: number;
}) {
  // Validação de capacidade
  const silo = await db.select().from(silos).where(eq(silos.id, data.siloId));

  if (silo.length === 0) {
    throw new Error("Silo não encontrado");
  }

  if (silo[0].capacidadeDisponivel < data.capacidadeReservada) {
    throw new Error("Capacidade insuficiente");
  }

  // Validação de conflito de datas
  const existingReservations = await db.select().from(reservas).where(
    and(
      eq(reservas.siloId, data.siloId),
      or(
        and(gte(reservas.dataInicio, data.dataInicio), lte(reservas.dataInicio, data.dataFim)),
        and(gte(reservas.dataFim, data.dataInicio), lte(reservas.dataFim, data.dataFim))
      )
    )
  );

  if (existingReservations.length > 0) {
    throw new Error("Conflito de datas: já existe uma reserva para este período.");
  }

  // Reduzir capacidade do silo
  const newCapacity = silo[0].capacidadeDisponivel - data.capacidadeReservada;
  await db.update(silos).set({ capacidadeDisponivel: newCapacity }).where(eq(silos.id, data.siloId));

  // Criar reserva e retornar o ID
  const [novaReserva] = await db.insert(reservas).values({
    ...data,
    status: "pendente",
    pagamentoStatus: "pendente",
    createdAt: new Date(),
  }).returning({ id: reservas.id });

  // Buscar dados do proprietário do silo para enviar e-mail
  const [proprietario] = await db.select().from(users).where(eq(users.id, silo[0].userId));
  
  // Buscar dados do produtor (cliente)
  const [produtor] = await db.select().from(users).where(eq(users.id, data.produtorId));
  
  // Registrar no histórico
  await historicoService.registrarAcao(
    novaReserva.id,
    data.produtorId,
    'criada',
    `Reserva de ${data.capacidadeReservada} toneladas criada`
  );

  // Enviar e-mail de notificação ao proprietário
  if (proprietario && proprietario.email && produtor) {
    await emailService.sendNovaReservaEmail(
      proprietario.email,
      proprietario.name || 'Proprietário',
      silo[0].nome || `Silo #${silo[0].id}`,
      produtor.name || 'Cliente',
      produtor.email || 'N/A',
      data.capacidadeReservada,
      data.dataInicio,
      data.dataFim,
      data.valorTotal
    );
  }

  return novaReserva;
}
