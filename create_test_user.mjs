import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users } from "./drizzle/schema.js";
import * as bcrypt from "bcryptjs";

async function createTestUser() {
  console.log('👤 Criando usuário de teste...\n');

  try {
    const client = createClient({
      url: "file:./siloshare.db",
    });
    const db = drizzle(client);

    const hashedPassword = await bcrypt.hash("senha123", 10);

    await db.insert(users).values({
      id: "test-user-id",
      name: "Carlos Silva - Produtor",
      email: "carlos@teste.com",
      password: hashedPassword,
      telefone: "(65) 98888-8888",
      role: "user",
      tipoUsuario: "produtor",
      verificado: 1,
      emailVerificado: 1,
      celularVerificado: 0,
      avaliacaoMedia: 4.5,
      totalAvaliacoes: 10,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('   ID: test-user-id');
    console.log('   Nome: Carlos Silva - Produtor');
    console.log('   E-mail: carlos@teste.com');
    console.log('   Senha: senha123\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

createTestUser();
