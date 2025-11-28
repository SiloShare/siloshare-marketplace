import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function testPreco() {
  const client = createClient({ url: "file:./siloshare.db" });
  const db = drizzle(client);

  console.log("🧪 Testando campo `preco` dos silos...\n");

  const allSilos = await db.select().from(silos).all();

  console.log(`📊 Encontrados ${allSilos.length} silos:\n`);

  allSilos.forEach((silo) => {
    console.log(`✅ Silo #${silo.id}: ${silo.nome}`);
    console.log(`   Preço: R$ ${silo.preco?.toFixed(2) || "UNDEFINED"}/ton/mês`);
    console.log(`   Capacidade: ${silo.capacidadeDisponivel}/${silo.capacidadeTotal} ton`);
    console.log("");
  });

  console.log("✅ Teste concluído!");
}

testPreco().catch(console.error);
