import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:./siloshare.db',
});

async function test() {
  console.log('🧪 Testando dados de reservas...\n');

  try {
    // Verificar reservas
    const reservas = await db.execute('SELECT * FROM reservas');
    console.log(`✅ Total de reservas: ${reservas.rows.length}\n`);
    
    if (reservas.rows.length > 0) {
      console.log('📋 Primeira reserva:');
      const r = reservas.rows[0];
      console.log(`   ID: ${r.id}`);
      console.log(`   Produtor: ${r.produtorId}`);
      console.log(`   Silo: ${r.siloId}`);
      console.log(`   Capacidade: ${r.capacidadeReservada} ton`);
      console.log(`   Valor: R$ ${r.valorTotal}`);
      console.log(`   Status: ${r.status}\n`);
    }

    // Verificar silos
    const silos = await db.execute('SELECT id, nome, userId FROM silos LIMIT 3');
    console.log(`✅ Total de silos: ${silos.rows.length}\n`);
    
    // Verificar usuários
    const users = await db.execute('SELECT id, name, email FROM users LIMIT 3');
    console.log(`✅ Total de usuários: ${users.rows.length}\n`);

    if (users.rows.length > 0) {
      console.log('👥 Usuários disponíveis para teste:');
      users.rows.forEach(u => {
        console.log(`   - ${u.email} (${u.name})`);
      });
    }

    console.log('\n✅ Dados prontos para teste!');
    console.log('\n📝 Acesse o servidor em: http://localhost:3001');
    console.log('   - /minhas-reservas (para ver suas reservas)');
    console.log('   - /reservas-recebidas (para proprietários de silos)');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

test();
