import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:./siloshare.db"
});

async function checkReservas() {
  try {
    const result = await client.execute("SELECT * FROM reservas");
    console.log("📊 Total de reservas no banco:", result.rows.length);
    
    if (result.rows.length > 0) {
      console.log("\n✅ Reservas encontradas:");
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Reserva ID ${row.id}:`);
        console.log(`   - Silo ID: ${row.siloId}`);
        console.log(`   - Cliente ID: ${row.clienteId}`);
        console.log(`   - Capacidade: ${row.capacidadeReservada} ton`);
        console.log(`   - Status: ${row.status}`);
        console.log(`   - Valor Total: R$ ${row.valorTotal}`);
      });
    } else {
      console.log("\n⚠️ Nenhuma reserva encontrada no banco de dados.");
      console.log("Isso é esperado se o fluxo de checkout não foi completado ainda.");
    }
  } catch (error: any) {
    console.error("❌ Erro ao consultar banco:", error.message);
  }
}

checkReservas();
