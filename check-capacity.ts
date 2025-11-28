import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: "file:./siloshare.db",
});

const db = drizzle(client);

async function checkCapacity() {
  console.log("🔍 Verificando capacidade do Silo #1...\n");
  
  const silo = await db.select().from(silos).where(eq(silos.id, 1));
  
  if (silo.length === 0) {
    console.log("❌ Silo não encontrado");
    return;
  }
  
  console.log("📊 Dados do Silo:");
  console.log(`   ID: ${silo[0].id}`);
  console.log(`   Nome: ${silo[0].nome}`);
  console.log(`   Capacidade Total: ${silo[0].capacidadeTotal} ton`);
  console.log(`   Capacidade Disponível: ${silo[0].capacidadeDisponivel} ton`);
  console.log(`   Preço: R$ ${silo[0].preco}/ton/mês`);
  console.log(`   Ocupação: ${((1 - silo[0].capacidadeDisponivel / silo[0].capacidadeTotal) * 100).toFixed(1)}%\n`);
}

checkCapacity();
