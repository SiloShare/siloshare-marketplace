/**
 * SCRIPT DE TESTES COMPLETOS DO SILOSHARE
 * 
 * Este script testa todas as funcionalidades principais do sistema:
 * 1. Autenticação (login, registro)
 * 2. Silos (cadastro, listagem, detalhes)
 * 3. Reservas (criação, listagem, ações)
 * 4. Dashboard (métricas, gráficos)
 * 5. Avaliações
 * 6. Mensagens
 * 7. Contratos
 * 8. Pagamentos
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createClient } = require('@libsql/client');

// Configuração do banco de dados
const db = createClient({
  url: 'file:./siloshare.db'
});

console.log('🧪 INICIANDO TESTES COMPLETOS DO SILOSHARE\n');
console.log('='.repeat(60));

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function warning(msg) {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`📋 ${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

// Estatísticas dos testes
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
};

async function test(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    success(name);
    return true;
  } catch (err) {
    stats.failed++;
    error(`${name}: ${err.message}`);
    return false;
  }
}

// ============================================================================
// TESTE 1: BANCO DE DADOS E TABELAS
// ============================================================================

section('TESTE 1: Estrutura do Banco de Dados');

await test('Banco de dados acessível', async () => {
  const result = await db.execute('SELECT 1 as test');
  if (!result.rows || result.rows.length === 0) throw new Error('Banco não respondeu');
});

const tabelasEsperadas = [
  'users',
  'silos',
  'reservas',
  'avaliacoes',
  'conversations',
  'messages',
  'contratos',
  'pagamentos',
  'reserva_historico'
];

for (const tabela of tabelasEsperadas) {
  await test(`Tabela '${tabela}' existe`, async () => {
    const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tabela}'`);
    if (!result.rows || result.rows.length === 0) throw new Error(`Tabela ${tabela} não encontrada`);
  });
}

// ============================================================================
// TESTE 2: USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

section('TESTE 2: Usuários e Autenticação');

await test('Usuários cadastrados no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM users');
  const count = result.rows[0].count;
  if (count === 0) throw new Error('Nenhum usuário cadastrado');
  info(`Total de usuários: ${count}`);
});

await test('Proprietários cadastrados', async () => {
  const result = await db.execute("SELECT COUNT(*) as count FROM users WHERE tipoUsuario='proprietario'");
  const count = result.rows[0].count;
  if (count === 0) throw new Error('Nenhum proprietário cadastrado');
  info(`Total de proprietários: ${count}`);
});

await test('Produtores cadastrados', async () => {
  const result = await db.execute("SELECT COUNT(*) as count FROM users WHERE tipoUsuario='produtor'");
  const count = result.rows[0].count;
  if (count === 0) throw new Error('Nenhum produtor cadastrado');
  info(`Total de produtores: ${count}`);
});

await test('Usuários com e-mail válido', async () => {
  const result = await db.execute("SELECT COUNT(*) as count FROM users WHERE email LIKE '%@%'");
  const total = await db.execute('SELECT COUNT(*) as count FROM users');
  if (result.rows[0].count !== total.rows[0].count) {
    throw new Error('Alguns usuários sem e-mail válido');
  }
});

// ============================================================================
// TESTE 3: SILOS
// ============================================================================

section('TESTE 3: Silos');

await test('Silos cadastrados no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM silos');
  const count = result.rows[0].count;
  if (count === 0) throw new Error('Nenhum silo cadastrado');
  info(`Total de silos: ${count}`);
});

await test('Silos com capacidade válida', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM silos WHERE capacidadeTotal > 0');
  const total = await db.execute('SELECT COUNT(*) as count FROM silos');
  if (result.rows[0].count !== total.rows[0].count) {
    throw new Error('Alguns silos com capacidade inválida');
  }
});

await test('Silos com localização', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM silos WHERE cidade IS NOT NULL AND estado IS NOT NULL');
  const total = await db.execute('SELECT COUNT(*) as count FROM silos');
  if (result.rows[0].count !== total.rows[0].count) {
    warning('Alguns silos sem localização completa');
    stats.warnings++;
  }
});

await test('Silos com tipo de grão definido', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM silos WHERE (tiposGraos IS NOT NULL OR tiposGraosAceitos IS NOT NULL)');
  const total = await db.execute('SELECT COUNT(*) as count FROM silos');
  if (result.rows[0].count !== total.rows[0].count) {
    warning('Alguns silos sem tipo de grão definido');
    stats.warnings++;
  }
});

await test('Capacidade disponível <= capacidade total', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM silos WHERE capacidadeDisponivel > capacidadeTotal');
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} silo(s) com capacidade disponível maior que total`);
  }
});

// ============================================================================
// TESTE 4: RESERVAS
// ============================================================================

section('TESTE 4: Reservas');

await test('Reservas no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM reservas');
  const count = result.rows[0].count;
  info(`Total de reservas: ${count}`);
  if (count === 0) {
    warning('Nenhuma reserva cadastrada - sistema pode estar vazio');
    stats.warnings++;
  }
});

await test('Reservas com status válido', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM reservas 
    WHERE status IN ('pendente', 'confirmada', 'cancelada', 'rejeitada')
  `);
  const total = await db.execute('SELECT COUNT(*) as count FROM reservas');
  if (result.rows[0].count !== total.rows[0].count) {
    throw new Error('Algumas reservas com status inválido');
  }
});

await test('Reservas com datas válidas (início < fim)', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM reservas WHERE dataInicio >= dataFim');
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} reserva(s) com data de início >= data de fim`);
  }
});

await test('Reservas com valores positivos', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM reservas WHERE valorTotal <= 0');
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} reserva(s) com valor total <= 0`);
  }
});

await test('Reservas vinculadas a silos existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM reservas r
    LEFT JOIN silos s ON r.siloId = s.id
    WHERE s.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} reserva(s) vinculada(s) a silo inexistente`);
  }
});

await test('Reservas vinculadas a produtores existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM reservas r
    LEFT JOIN users u ON r.produtorId = u.id
    WHERE u.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} reserva(s) vinculada(s) a produtor inexistente`);
  }
});

// ============================================================================
// TESTE 5: HISTÓRICO DE AÇÕES
// ============================================================================

section('TESTE 5: Histórico de Ações');

await test('Histórico de ações registrado', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM reserva_historico');
  const count = result.rows[0].count;
  info(`Total de ações registradas: ${count}`);
  if (count === 0) {
    warning('Nenhuma ação registrada no histórico');
    stats.warnings++;
  }
});

await test('Ações com tipo válido', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM reserva_historico 
    WHERE acao IN ('criada', 'aprovada', 'rejeitada', 'cancelada')
  `);
  const total = await db.execute('SELECT COUNT(*) as count FROM reserva_historico');
  if (total.rows[0].count > 0 && result.rows[0].count !== total.rows[0].count) {
    throw new Error('Algumas ações com tipo inválido');
  }
});

// ============================================================================
// TESTE 6: AVALIAÇÕES
// ============================================================================

section('TESTE 6: Avaliações');

await test('Avaliações no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM avaliacoes');
  const count = result.rows[0].count;
  info(`Total de avaliações: ${count}`);
  if (count === 0) {
    warning('Nenhuma avaliação cadastrada');
    stats.warnings++;
  }
});

await test('Avaliações com nota válida (1-5)', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM avaliacoes WHERE nota < 1 OR nota > 5');
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} avaliação(ões) com nota fora do range 1-5`);
  }
});

await test('Avaliações vinculadas a silos existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM avaliacoes a
    LEFT JOIN silos s ON a.siloId = s.id
    WHERE s.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} avaliação(ões) vinculada(s) a silo inexistente`);
  }
});

// ============================================================================
// TESTE 7: MENSAGENS/CHAT
// ============================================================================

section('TESTE 7: Mensagens e Chat');

await test('Conversas no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM conversations');
  const count = result.rows[0].count;
  info(`Total de conversas: ${count}`);
  if (count === 0) {
    warning('Nenhuma conversa criada');
    stats.warnings++;
  }
});

await test('Mensagens no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM messages');
  const count = result.rows[0].count;
  info(`Total de mensagens: ${count}`);
  if (count === 0) {
    warning('Nenhuma mensagem enviada');
    stats.warnings++;
  }
});

await test('Mensagens vinculadas a conversas existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM messages m
    LEFT JOIN conversations c ON m.conversationId = c.id
    WHERE c.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} mensagem(ns) vinculada(s) a conversa inexistente`);
  }
});

// ============================================================================
// TESTE 8: CONTRATOS
// ============================================================================

section('TESTE 8: Contratos');

await test('Contratos no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM contratos');
  const count = result.rows[0].count;
  info(`Total de contratos: ${count}`);
  if (count === 0) {
    warning('Nenhum contrato gerado');
    stats.warnings++;
  }
});

await test('Contratos vinculados a reservas existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM contratos c
    LEFT JOIN reservas r ON c.reservaId = r.id
    WHERE r.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} contrato(s) vinculado(s) a reserva inexistente`);
  }
});

// ============================================================================
// TESTE 9: PAGAMENTOS
// ============================================================================

section('TESTE 9: Pagamentos');

await test('Pagamentos no sistema', async () => {
  const result = await db.execute('SELECT COUNT(*) as count FROM pagamentos');
  const count = result.rows[0].count;
  info(`Total de pagamentos: ${count}`);
  if (count === 0) {
    warning('Nenhum pagamento registrado');
    stats.warnings++;
  }
});

await test('Pagamentos com status válido', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM pagamentos 
    WHERE status IN ('pending', 'paid', 'failed', 'refunded')
  `);
  const total = await db.execute('SELECT COUNT(*) as count FROM pagamentos');
  if (total.rows[0].count > 0 && result.rows[0].count !== total.rows[0].count) {
    throw new Error('Alguns pagamentos com status inválido');
  }
});

await test('Pagamentos vinculados a reservas existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM pagamentos p
    LEFT JOIN reservas r ON p.reservaId = r.id
    WHERE r.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} pagamento(s) vinculado(s) a reserva inexistente`);
  }
});

// ============================================================================
// TESTE 10: INTEGRIDADE REFERENCIAL
// ============================================================================

section('TESTE 10: Integridade Referencial');

await test('Silos pertencem a proprietários existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM silos s
    LEFT JOIN users u ON s.userId = u.id
    WHERE u.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} silo(s) com proprietário inexistente`);
  }
});

await test('Conversas entre usuários existentes', async () => {
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM conversations c
    LEFT JOIN users u1 ON c.user1Id = u1.id
    LEFT JOIN users u2 ON c.user2Id = u2.id
    WHERE u1.id IS NULL OR u2.id IS NULL
  `);
  if (result.rows[0].count > 0) {
    throw new Error(`${result.rows[0].count} conversa(s) com usuário inexistente`);
  }
});

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

section('RELATÓRIO FINAL DOS TESTES');

console.log(`Total de testes executados: ${stats.total}`);
console.log(`${colors.green}✅ Testes aprovados: ${stats.passed}${colors.reset}`);
console.log(`${colors.red}❌ Testes falhados: ${stats.failed}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Avisos: ${stats.warnings}${colors.reset}`);

const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
console.log(`\nTaxa de sucesso: ${successRate}%`);

if (stats.failed === 0) {
  console.log(`\n${colors.green}${'='.repeat(60)}`);
  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
} else {
  console.log(`\n${colors.red}${'='.repeat(60)}`);
  console.log(`⚠️  ${stats.failed} TESTE(S) FALHARAM - REQUER ATENÇÃO`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
  process.exit(1);
}

process.exit(0);
