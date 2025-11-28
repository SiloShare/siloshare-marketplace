import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { silos, users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import { sendNovaReservaEmail } from "./server/services/emailService.ts";

async function testNovaReservaEmail() {
  console.log('🔔 Testando e-mail de Nova Reserva...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    // Buscar um silo de teste
    const [silo] = await db.select().from(silos).where(eq(silos.id, 2));
    if (!silo) {
      console.log('❌ Silo não encontrado');
      return;
    }

    // Buscar proprietário do silo
    const [proprietario] = await db.select().from(users).where(eq(users.id, silo.userId));
    if (!proprietario) {
      console.log('❌ Proprietário não encontrado');
      return;
    }

    // Buscar um produtor (cliente) de teste
    const [produtor] = await db.select().from(users).where(eq(users.id, 'test-user-id'));
    if (!produtor) {
      console.log('❌ Produtor não encontrado');
      return;
    }

    console.log('📊 Dados do Teste:');
    console.log(`   Silo: ${silo.nome} (ID: ${silo.id})`);
    console.log(`   Proprietário: ${proprietario.name} (${proprietario.email})`);
    console.log(`   Cliente: ${produtor.name} (${produtor.email})`);
    console.log('');

    // Dados simulados da reserva
    const capacidade = 500;
    const dataInicio = new Date('2025-12-01');
    const dataFim = new Date('2026-03-31');
    const valorTotal = 62500; // R$ 62.500,00

    console.log('📋 Detalhes da Reserva Simulada:');
    console.log(`   Capacidade: ${capacidade} toneladas`);
    console.log(`   Período: ${dataInicio.toLocaleDateString('pt-BR')} até ${dataFim.toLocaleDateString('pt-BR')}`);
    console.log(`   Valor Total: R$ ${valorTotal.toLocaleString('pt-BR')}`);
    console.log('');

    // Teste: Enviar e-mail de nova reserva
    console.log('🔔 Enviando e-mail de nova reserva para o proprietário...\n');
    
    const result = await sendNovaReservaEmail(
      proprietario.email,
      proprietario.name || 'Proprietário',
      silo.nome || `Silo #${silo.id}`,
      produtor.name || 'Cliente',
      produtor.email || 'N/A',
      capacidade,
      dataInicio,
      dataFim,
      valorTotal
    );

    if (result.success) {
      console.log(`✅ E-mail de nova reserva enviado com sucesso!`);
      console.log(`📧 Message ID: ${result.messageId || 'N/A'}\n`);
    } else {
      console.log(`❌ Erro ao enviar e-mail: ${result.error}\n`);
    }

    // Resumo
    console.log('📝 Resumo do Teste:');
    console.log(`   - E-mail enviado para: ${proprietario.email}`);
    console.log(`   - Status: ${result.success ? '✅ Sucesso' : '❌ Falhou'}`);
    
    if (result.success) {
      console.log('\n✅ Teste de e-mail de nova reserva passou!');
      console.log('\n📌 Nota: O e-mail foi enviado para: ' + proprietario.email);
      console.log('   Verifique a caixa de entrada (ou spam) para confirmar o recebimento.');
      console.log('\n📧 Conteúdo do E-mail:');
      console.log('   - Banner azul de notificação 🔔');
      console.log('   - Título: "Nova Reserva Recebida!"');
      console.log('   - Detalhes da reserva (silo, capacidade, período, valor)');
      console.log('   - Informações do cliente (nome e e-mail)');
      console.log('   - Seção "Ação Necessária" destacada');
    } else {
      console.log('\n⚠️  E-mail falhou. Verifique a configuração do serviço de e-mail.');
      console.log('   - Certifique-se de que RESEND_API_KEY está configurada');
      console.log('   - Verifique se o domínio está verificado no Resend');
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
}

testNovaReservaEmail();
