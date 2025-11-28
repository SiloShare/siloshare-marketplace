/**
 * Script para corrigir tipos de usuários no banco de dados
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'file:./siloshare.db'
});

console.log('🔧 Corrigindo tipos de usuários...\n');

// Listar usuários atuais
const users = await db.execute('SELECT id, name, email, tipoUsuario FROM users');

console.log('Usuários encontrados:');
users.rows.forEach(user => {
  console.log(`- ${user.name} (${user.email}) - Tipo: ${user.tipoUsuario || 'NÃO DEFINIDO'}`);
});

// Atualizar usuário proprietario@siloshare.com para proprietário
await db.execute(`
  UPDATE users 
  SET tipoUsuario = 'proprietario' 
  WHERE email = 'proprietario@siloshare.com'
`);

// Atualizar usuário carlos@teste.com para produtor
await db.execute(`
  UPDATE users 
  SET tipoUsuario = 'produtor' 
  WHERE email = 'carlos@teste.com'
`);

// Verificar se há usuários sem tipo definido e definir como produtor por padrão
await db.execute(`
  UPDATE users 
  SET tipoUsuario = 'produtor' 
  WHERE tipoUsuario IS NULL OR tipoUsuario = ''
`);

console.log('\n✅ Tipos de usuários atualizados!');

// Listar usuários após atualização
const usersAfter = await db.execute('SELECT id, name, email, tipoUsuario FROM users');

console.log('\nUsuários após atualização:');
usersAfter.rows.forEach(user => {
  console.log(`- ${user.name} (${user.email}) - Tipo: ${user.tipoUsuario}`);
});

console.log('\n✨ Correção concluída!');
