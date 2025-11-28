import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, reservas, users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import { sendReservaAprovadaEmail, sendReservaRejeitadaEmail } from "./server/services/emailService.ts";

async function testEmailNotifications() {
  console.log('📧 Testando notificações por e-mail...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    // Buscar dados da reserva de teste
    const [reserva] = await db.select().from(reservas).where(eq(reservas.id, 1));
    if (!reserva) {
      console.log('❌ Reserva não encontrada');
      return;
    }

    // Buscar dados do silo
    const [silo] = await db.select().from(silos).where(eq(silos.id, reserva.siloId));
    if (!silo) {
      console.log('❌ Silo não encontrado');
      return;
    }

    // Buscar dados do produtor
    const [produtor] = await db.select().from(users).where(eq(users.id, reserva.produtorId));
    if (!produtor) {
      console.log('❌ Produtor não encontrado');
      return;
    }

    console.log('📊 Dados da Reserva:');
    console.log(`   ID: ${reserva.id}`);
    console.log(`   Silo: ${silo.nome}`);
    console.log(`   Produtor: ${produtor.name} (${produtor.email})`);
    console.log(`   Capacidade: ${reserva.capacidadeReservada} ton`);
    console.log(`   Valor: R$ ${reserva.valorTotal.toLocaleString('pt-BR')}`);
    console.log(`   Status: ${reserva.status}\n`);

    // Teste 1: E-mail de Aprovação
    console.log('✅ Teste 1: E-mail de Aprovação');
    console.log('   Enviando e-mail de aprovação...\n');
    
    const resultAprovacao = await sendReservaAprovadaEmail(
      produtor.email,
      produtor.name || 'Cliente',
      silo.nome || `Silo #${silo.id}`,
      reserva.capacidadeReservada,
      reserva.dataInicio,
      reserva.dataFim,
      reserva.valorTotal
    );

    if (resultAprovacao.success) {
      console.log(`   ✅ E-mail de aprovação enviado com sucesso!`);
      console.log(`   📧 Message ID: ${resultAprovacao.messageId || 'N/A'}\n`);
    } else {
      console.log(`   ❌ Erro ao enviar e-mail: ${resultAprovacao.error}\n`);
    }

    // Aguardar um pouco antes do próximo teste
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teste 2: E-mail de Rejeição (sem motivo)
    console.log('❌ Teste 2: E-mail de Rejeição (sem motivo)');
    console.log('   Enviando e-mail de rejeição...\n');
    
    const resultRejeicao1 = await sendReservaRejeitadaEmail(
      produtor.email,
      produtor.name || 'Cliente',
      silo.nome || `Silo #${silo.id}`,
      reserva.capacidadeReservada,
      reserva.dataInicio,
      reserva.dataFim,
      reserva.valorTotal
    );

    if (resultRejeicao1.success) {
      console.log(`   ✅ E-mail de rejeição enviado com sucesso!`);
      console.log(`   📧 Message ID: ${resultRejeicao1.messageId || 'N/A'}\n`);
    } else {
      console.log(`   ❌ Erro ao enviar e-mail: ${resultRejeicao1.error}\n`);
    }

    // Aguardar um pouco antes do próximo teste
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teste 3: E-mail de Rejeição (com motivo)
    console.log('❌ Teste 3: E-mail de Rejeição (com motivo)');
    console.log('   Enviando e-mail de rejeição com motivo...\n');
    
    const motivo = 'Infelizmente, o período solicitado já está reservado por outro cliente. Por favor, escolha outras datas ou entre em contato para verificar disponibilidade.';
    
    const resultRejeicao2 = await sendReservaRejeitadaEmail(
      produtor.email,
      produtor.name || 'Cliente',
      silo.nome || `Silo #${silo.id}`,
      reserva.capacidadeReservada,
      reserva.dataInicio,
      reserva.dataFim,
      reserva.valorTotal,
      motivo
    );

    if (resultRejeicao2.success) {
      console.log(`   ✅ E-mail de rejeição com motivo enviado com sucesso!`);
      console.log(`   📧 Message ID: ${resultRejeicao2.messageId || 'N/A'}\n`);
    } else {
      console.log(`   ❌ Erro ao enviar e-mail: ${resultRejeicao2.error}\n`);
    }

    // Resumo
    console.log('📝 Resumo dos Testes:');
    console.log(`   - E-mail de Aprovação: ${resultAprovacao.success ? '✅' : '❌'}`);
    console.log(`   - E-mail de Rejeição (sem motivo): ${resultRejeicao1.success ? '✅' : '❌'}`);
    console.log(`   - E-mail de Rejeição (com motivo): ${resultRejeicao2.success ? '✅' : '❌'}`);
    
    const totalSuccess = [resultAprovacao, resultRejeicao1, resultRejeicao2].filter(r => r.success).length;
    console.log(`\n🎉 ${totalSuccess}/3 e-mails enviados com sucesso!`);

    if (totalSuccess === 3) {
      console.log('\n✅ Todos os testes de e-mail passaram!');
      console.log('\n📌 Nota: Os e-mails foram enviados para: ' + produtor.email);
      console.log('   Verifique a caixa de entrada (ou spam) para confirmar o recebimento.');
    } else {
      console.log('\n⚠️  Alguns e-mails falharam. Verifique a configuração do serviço de e-mail.');
      console.log('   - Certifique-se de que RESEND_API_KEY está configurada');
      console.log('   - Verifique se o domínio está verificado no Resend');
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
}

testEmailNotifications();
