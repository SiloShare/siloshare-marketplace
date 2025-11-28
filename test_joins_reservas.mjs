import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users, silos, reservas } from "./drizzle/schema.js";
import { eq, inArray } from "drizzle-orm";

async function testJoinsReservas() {
  console.log('🧪 Testando endpoints com JOINs...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    // Teste 1: myReservations com JOIN
    console.log('📋 Teste 1: myReservations (com nome do silo)');
    const testUserId = 'test-user-id';
    
    const myReservations = await db
      .select({
        id: reservas.id,
        siloId: reservas.siloId,
        siloNome: silos.nome,
        produtorId: reservas.produtorId,
        capacidadeReservada: reservas.capacidadeReservada,
        dataInicio: reservas.dataInicio,
        dataFim: reservas.dataFim,
        valorTotal: reservas.valorTotal,
        status: reservas.status,
      })
      .from(reservas)
      .leftJoin(silos, eq(reservas.siloId, silos.id))
      .where(eq(reservas.produtorId, testUserId));

    console.log(`   ✅ Encontradas ${myReservations.length} reservas`);
    if (myReservations.length > 0) {
      const r = myReservations[0];
      console.log(`   📦 Reserva #${r.id}:`);
      console.log(`      - Silo: ${r.siloNome || 'N/A'} (ID: ${r.siloId})`);
      console.log(`      - Capacidade: ${r.capacidadeReservada} ton`);
      console.log(`      - Valor: R$ ${r.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`      - Status: ${r.status}\n`);
    }

    // Teste 2: receivedReservations com JOIN duplo
    console.log('📋 Teste 2: receivedReservations (com nomes de silo e produtor)');
    
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
      console.log('   ❌ Nenhum usuário encontrado\n');
      return;
    }
    
    const ownerId = allUsers[0].id;
    console.log(`   👤 Proprietário: ${allUsers[0].name} (${ownerId})`);
    
    const userSilos = await db.select({ id: silos.id }).from(silos).where(eq(silos.userId, ownerId));
    const siloIds = userSilos.map(s => s.id);
    
    console.log(`   🏢 Silos do proprietário: ${siloIds.length}`);
    
    if (siloIds.length === 0) {
      console.log('   ⚠️  Proprietário não tem silos\n');
      return;
    }
    
    const receivedReservations = await db
      .select({
        id: reservas.id,
        siloId: reservas.siloId,
        siloNome: silos.nome,
        produtorId: reservas.produtorId,
        produtorNome: users.name,
        produtorEmail: users.email,
        capacidadeReservada: reservas.capacidadeReservada,
        dataInicio: reservas.dataInicio,
        dataFim: reservas.dataFim,
        valorTotal: reservas.valorTotal,
        status: reservas.status,
      })
      .from(reservas)
      .leftJoin(silos, eq(reservas.siloId, silos.id))
      .leftJoin(users, eq(reservas.produtorId, users.id))
      .where(inArray(reservas.siloId, siloIds));

    console.log(`   ✅ Encontradas ${receivedReservations.length} reservas recebidas`);
    if (receivedReservations.length > 0) {
      const r = receivedReservations[0];
      console.log(`   📦 Reserva #${r.id}:`);
      console.log(`      - Silo: ${r.siloNome || 'N/A'} (ID: ${r.siloId})`);
      console.log(`      - Produtor: ${r.produtorNome || 'N/A'} (${r.produtorEmail || 'N/A'})`);
      console.log(`      - Capacidade: ${r.capacidadeReservada} ton`);
      console.log(`      - Valor: R$ ${r.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`      - Status: ${r.status}\n`);
    }

    // Resumo
    console.log('✅ Todos os testes de JOIN concluídos com sucesso!');
    console.log('\n📝 Resultados:');
    console.log(`   - myReservations retorna siloNome: ${myReservations.length > 0 && myReservations[0].siloNome ? '✅' : '❌'}`);
    console.log(`   - receivedReservations retorna siloNome: ${receivedReservations.length > 0 && receivedReservations[0].siloNome ? '✅' : '❌'}`);
    console.log(`   - receivedReservations retorna produtorNome: ${receivedReservations.length > 0 && receivedReservations[0].produtorNome ? '✅' : '❌'}`);
    console.log(`   - receivedReservations retorna produtorEmail: ${receivedReservations.length > 0 && receivedReservations[0].produtorEmail ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
}

testJoinsReservas();
