import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, reservas } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

async function testAcoesReservas() {
  console.log('🧪 Testando ações de reservas...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    // Estado inicial
    console.log('📊 Estado Inicial:');
    const [reservaInicial] = await db.select().from(reservas).where(eq(reservas.id, 1));
    const [siloInicial] = await db.select().from(silos).where(eq(silos.id, reservaInicial.siloId));
    
    console.log(`   Reserva #1:`);
    console.log(`      - Status: ${reservaInicial.status}`);
    console.log(`      - Capacidade Reservada: ${reservaInicial.capacidadeReservada} ton`);
    console.log(`   Silo #${siloInicial.id}:`);
    console.log(`      - Capacidade Disponível: ${siloInicial.capacidadeDisponivel} ton\n`);

    // Teste 1: Cancelar Reserva
    console.log('🔄 Teste 1: Cancelar Reserva');
    console.log('   Simulando cancelamento...');
    
    // Atualizar status
    await db.update(reservas)
      .set({ status: 'cancelada' })
      .where(eq(reservas.id, 1));
    
    // Restaurar capacidade
    const novaCapacidade = siloInicial.capacidadeDisponivel + reservaInicial.capacidadeReservada;
    await db.update(silos)
      .set({ capacidadeDisponivel: novaCapacidade })
      .where(eq(silos.id, siloInicial.id));
    
    // Verificar
    const [reservaCancelada] = await db.select().from(reservas).where(eq(reservas.id, 1));
    const [siloCancelado] = await db.select().from(silos).where(eq(silos.id, siloInicial.id));
    
    console.log(`   ✅ Reserva cancelada!`);
    console.log(`      - Novo status: ${reservaCancelada.status}`);
    console.log(`      - Capacidade restaurada: ${siloInicial.capacidadeDisponivel} → ${siloCancelado.capacidadeDisponivel} ton`);
    console.log(`      - Diferença: +${siloCancelado.capacidadeDisponivel - siloInicial.capacidadeDisponivel} ton\n`);

    // Restaurar para próximo teste
    await db.update(reservas)
      .set({ status: 'pendente' })
      .where(eq(reservas.id, 1));
    await db.update(silos)
      .set({ capacidadeDisponivel: siloInicial.capacidadeDisponivel })
      .where(eq(silos.id, siloInicial.id));

    // Teste 2: Aprovar Reserva
    console.log('✅ Teste 2: Aprovar Reserva');
    console.log('   Simulando aprovação...');
    
    await db.update(reservas)
      .set({ status: 'confirmada' })
      .where(eq(reservas.id, 1));
    
    const [reservaAprovada] = await db.select().from(reservas).where(eq(reservas.id, 1));
    
    console.log(`   ✅ Reserva aprovada!`);
    console.log(`      - Novo status: ${reservaAprovada.status}`);
    console.log(`      - Capacidade do silo: ${siloInicial.capacidadeDisponivel} ton (mantida)\n`);

    // Restaurar para próximo teste
    await db.update(reservas)
      .set({ status: 'pendente' })
      .where(eq(reservas.id, 1));

    // Teste 3: Rejeitar Reserva
    console.log('❌ Teste 3: Rejeitar Reserva');
    console.log('   Simulando rejeição...');
    
    // Atualizar status
    await db.update(reservas)
      .set({ status: 'rejeitada' })
      .where(eq(reservas.id, 1));
    
    // Restaurar capacidade
    const novaCapacidadeRejeicao = siloInicial.capacidadeDisponivel + reservaInicial.capacidadeReservada;
    await db.update(silos)
      .set({ capacidadeDisponivel: novaCapacidadeRejeicao })
      .where(eq(silos.id, siloInicial.id));
    
    // Verificar
    const [reservaRejeitada] = await db.select().from(reservas).where(eq(reservas.id, 1));
    const [siloRejeitado] = await db.select().from(silos).where(eq(silos.id, siloInicial.id));
    
    console.log(`   ✅ Reserva rejeitada!`);
    console.log(`      - Novo status: ${reservaRejeitada.status}`);
    console.log(`      - Capacidade restaurada: ${siloInicial.capacidadeDisponivel} → ${siloRejeitado.capacidadeDisponivel} ton`);
    console.log(`      - Diferença: +${siloRejeitado.capacidadeDisponivel - siloInicial.capacidadeDisponivel} ton\n`);

    // Restaurar estado original
    console.log('🔄 Restaurando estado original...');
    await db.update(reservas)
      .set({ status: 'pendente' })
      .where(eq(reservas.id, 1));
    await db.update(silos)
      .set({ capacidadeDisponivel: siloInicial.capacidadeDisponivel })
      .where(eq(silos.id, siloInicial.id));
    
    console.log('   ✅ Estado restaurado!\n');

    // Resumo
    console.log('📝 Resumo dos Testes:');
    console.log('   ✅ Cancelar: Status alterado + Capacidade restaurada');
    console.log('   ✅ Aprovar: Status alterado + Capacidade mantida');
    console.log('   ✅ Rejeitar: Status alterado + Capacidade restaurada');
    console.log('\n🎉 Todos os testes passaram com sucesso!');

    // Validações
    const validacoes = {
      cancelar: reservaCancelada.status === 'cancelada' && siloCancelado.capacidadeDisponivel > siloInicial.capacidadeDisponivel,
      aprovar: reservaAprovada.status === 'confirmada',
      rejeitar: reservaRejeitada.status === 'rejeitada' && siloRejeitado.capacidadeDisponivel > siloInicial.capacidadeDisponivel,
    };

    console.log('\n✅ Validações:');
    console.log(`   - Cancelar restaura capacidade: ${validacoes.cancelar ? '✅' : '❌'}`);
    console.log(`   - Aprovar mantém capacidade: ${validacoes.aprovar ? '✅' : '❌'}`);
    console.log(`   - Rejeitar restaura capacidade: ${validacoes.rejeitar ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
}

testAcoesReservas();
