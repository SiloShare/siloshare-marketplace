import { createReserva } from "./server/db-reservas";

async function testCompleteFlow() {
  console.log("🧪 Iniciando Teste Completo do Fluxo de Reserva\n");
  console.log("=" + "=".repeat(60) + "\n");
  
  // Dados da reserva de teste
  const reservaData = {
    siloId: 1,
    produtorId: 2, // ID do usuário Carlos (cliente que está reservando)
    capacidadeReservada: 2000, // 2.000 toneladas
    dataInicio: new Date("2025-01-15"),
    dataFim: new Date("2025-06-15"),
    valorTotal: 342000, // R$ 28,50 x 2000 ton x 6 meses = R$ 342.000
    status: "pendente" as const,
  };
  
  console.log("📋 Dados da Reserva:");
  console.log(`   Silo ID: ${reservaData.siloId}`);
  console.log(`   Produtor ID (Cliente): ${reservaData.produtorId}`);
  console.log(`   Capacidade Reservada: ${reservaData.capacidadeReservada} ton`);
  console.log(`   Período: ${reservaData.dataInicio} a ${reservaData.dataFim}`);
  console.log(`   Valor Total: R$ ${reservaData.valorTotal.toLocaleString("pt-BR")}`);
  console.log(`   Status: ${reservaData.status}\n`);
  
  try {
    console.log("⏳ Criando reserva...\n");
    
    const result = await createReserva(reservaData);
    
    console.log("✅ Reserva criada com sucesso!");
    console.log(`   ID da Reserva: ${result.id}\n`);
    
    console.log("=" + "=".repeat(60));
    console.log("🎉 TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=" + "=".repeat(60) + "\n");
    
    console.log("📊 Próximo Passo:");
    console.log("   Execute 'npx tsx check-capacity.ts' para verificar");
    console.log("   se a capacidade do silo foi reduzida de 7.500 para 5.500 ton.\n");
    
  } catch (error) {
    console.error("❌ Erro ao criar reserva:");
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes("Capacidade insuficiente")) {
      console.log("ℹ️  Este erro é esperado se não houver capacidade suficiente.");
    } else if (error.message.includes("Conflito de datas")) {
      console.log("ℹ️  Este erro é esperado se já existir uma reserva para este período.");
    }
  }
}

testCompleteFlow();
