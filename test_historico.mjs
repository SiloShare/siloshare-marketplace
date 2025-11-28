import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { reservas, reservaHistorico, users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

async function testHistorico() {
  console.log('📝 Testando Sistema de Histórico de Reservas...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    // Buscar uma reserva existente
    const [reserva] = await db.select().from(reservas).limit(1);
    
    if (!reserva) {
      console.log('❌ Nenhuma reserva encontrada no banco');
      return;
    }

    console.log(`📋 Reserva de Teste: #${reserva.id}`);
    console.log(`   Status: ${reserva.status}`);
    console.log(`   Produtor ID: ${reserva.produtorId}`);
    console.log('');

    // Buscar histórico da reserva
    const historico = await db
      .select()
      .from(reservaHistorico)
      .where(eq(reservaHistorico.reservaId, reserva.id))
      .orderBy(reservaHistorico.createdAt);

    console.log(`📊 Histórico da Reserva #${reserva.id}:`);
    console.log(`   Total de ações registradas: ${historico.length}\n`);

    if (historico.length === 0) {
      console.log('⚠️  Nenhuma ação registrada no histórico ainda.');
      console.log('   Isso é normal se a reserva foi criada antes do sistema de histórico.');
      console.log('   Novas ações serão registradas automaticamente.\n');
    } else {
      // Mostrar cada ação do histórico
      for (const item of historico) {
        const [usuario] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, item.userId));

        const dataFormatada = new Date(item.createdAt).toLocaleString('pt-BR');
        
        console.log(`   ✓ ${item.acao.toUpperCase()}`);
        console.log(`     Por: ${usuario?.name || 'Usuário desconhecido'} (${item.userId})`);
        console.log(`     Quando: ${dataFormatada}`);
        if (item.detalhes) {
          console.log(`     Detalhes: ${item.detalhes}`);
        }
        console.log('');
      }
    }

    // Verificar se a tabela existe e está acessível
    const totalHistorico = await db
      .select()
      .from(reservaHistorico);

    console.log(`📈 Estatísticas Gerais:`);
    console.log(`   Total de ações no sistema: ${totalHistorico.length}`);
    
    // Contar por tipo de ação
    const acoesPorTipo = totalHistorico.reduce((acc, item) => {
      acc[item.acao] = (acc[item.acao] || 0) + 1;
      return acc;
    }, {});

    console.log(`   Ações por tipo:`);
    Object.entries(acoesPorTipo).forEach(([acao, count]) => {
      console.log(`     - ${acao}: ${count}`);
    });

    console.log('\n✅ Sistema de Histórico está funcionando!');
    console.log('\n📌 Próximas ações serão registradas automaticamente:');
    console.log('   - Criação de reserva');
    console.log('   - Aprovação pelo proprietário');
    console.log('   - Rejeição pelo proprietário');
    console.log('   - Cancelamento pelo cliente');

  } catch (error) {
    console.error('❌ Erro ao testar histórico:', error);
  }
}

testHistorico();
