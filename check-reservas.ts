import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { reservas } from "./drizzle/schema";

const client = createClient({
  url: "file:./siloshare.db",
});

const db = drizzle(client);

async function checkReservas() {
  console.log("🔍 Verificando reservas no banco de dados...\n");
  
  const allReservas = await db.select().from(reservas);
  
  if (allReservas.length === 0) {
    console.log("❌ Nenhuma reserva encontrada no banco de dados.\n");
    return;
  }
  
  console.log(`✅ ${allReservas.length} reserva(s) encontrada(s):\n`);
  
  allReservas.forEach((reserva, index) => {
    console.log(`📋 Reserva #${index + 1}:`);
    console.log(`   ID: ${reserva.id}`);
    console.log(`   Silo ID: ${reserva.siloId}`);
    console.log(`   Produtor ID: ${reserva.produtorId}`);
    console.log(`   Capacidade Reservada: ${reserva.capacidadeReservada} ton`);
    console.log(`   Data Início: ${new Date(reserva.dataInicio).toLocaleDateString("pt-BR")}`);
    console.log(`   Data Fim: ${new Date(reserva.dataFim).toLocaleDateString("pt-BR")}`);
    console.log(`   Valor Total: R$ ${reserva.valorTotal.toLocaleString("pt-BR")}`);
    console.log(`   Status: ${reserva.status}`);
    console.log(`   Pagamento Status: ${reserva.pagamentoStatus}`);
    console.log(`   Criado em: ${new Date(reserva.createdAt).toLocaleString("pt-BR")}\n`);
  });
}

checkReservas();
