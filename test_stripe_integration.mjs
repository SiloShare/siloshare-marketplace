import Stripe from 'stripe';
import 'dotenv/config';

console.log('🧪 Testando Integração do Stripe...\n');

// Verificar se as chaves estão configuradas
console.log('1️⃣ Verificando variáveis de ambiente:');
console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   STRIPE_PUBLISHABLE_KEY: ${process.env.STRIPE_PUBLISHABLE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('\n❌ ERRO: STRIPE_SECRET_KEY não está configurada no .env');
  process.exit(1);
}

// Inicializar Stripe
console.log('\n2️⃣ Inicializando cliente Stripe...');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});
console.log('   ✅ Cliente Stripe inicializado');

// Testar conexão com a API
console.log('\n3️⃣ Testando conexão com API do Stripe...');
try {
  const balance = await stripe.balance.retrieve();
  console.log('   ✅ Conexão bem-sucedida!');
  console.log(`   💰 Saldo disponível: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'BRL'}`);
  console.log(`   💳 Saldo pendente: ${balance.pending[0]?.amount || 0} ${balance.pending[0]?.currency || 'BRL'}`);
} catch (error) {
  console.log('   ❌ Erro ao conectar:', error.message);
  process.exit(1);
}

// Criar uma sessão de checkout de teste
console.log('\n4️⃣ Criando sessão de checkout de teste...');
try {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Teste - Reserva de Silo',
            description: 'Teste de integração do Stripe',
          },
          unit_amount: 10000, // R$ 100,00 em centavos
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3001/success',
    cancel_url: 'http://localhost:3001/cancel',
    metadata: {
      test: 'true',
      reservaId: '999',
    },
  });

  console.log('   ✅ Sessão de checkout criada com sucesso!');
  console.log(`   🆔 Session ID: ${session.id}`);
  console.log(`   🔗 URL de pagamento: ${session.url}`);
  console.log(`   💰 Valor: R$ 100,00`);
  console.log(`   📊 Status: ${session.payment_status}`);
} catch (error) {
  console.log('   ❌ Erro ao criar sessão:', error.message);
  process.exit(1);
}

// Listar últimos eventos
console.log('\n5️⃣ Listando últimos eventos do Stripe...');
try {
  const events = await stripe.events.list({ limit: 3 });
  console.log(`   ✅ ${events.data.length} eventos encontrados:`);
  events.data.forEach((event, index) => {
    console.log(`   ${index + 1}. ${event.type} - ${new Date(event.created * 1000).toLocaleString('pt-BR')}`);
  });
} catch (error) {
  console.log('   ⚠️ Não foi possível listar eventos:', error.message);
}

console.log('\n✅ TESTE COMPLETO! Integração do Stripe está funcionando perfeitamente!');
console.log('\n📝 Próximos passos:');
console.log('   1. Configure o webhook no dashboard do Stripe');
console.log('   2. Adicione o botão de pagamento no checkout');
console.log('   3. Teste um pagamento real com cartão de teste');
console.log('\n💳 Cartões de teste do Stripe:');
console.log('   Sucesso: 4242 4242 4242 4242');
console.log('   Falha: 4000 0000 0000 0002');
console.log('   3D Secure: 4000 0025 0000 3155');
console.log('   Data: Qualquer data futura');
console.log('   CVV: Qualquer 3 dígitos');
