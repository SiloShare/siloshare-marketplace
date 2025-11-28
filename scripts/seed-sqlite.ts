import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users, silos } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("🌱 Populando banco de dados SQLite com dados de teste...\n");

  try {
    // Conectar ao banco de dados
    const client = createClient({
      url: "file:./siloshare.db",
    });

    const db = drizzle(client);
    console.log("✅ Conectado ao banco de dados SQLite\n");

    // Criar usuário proprietário de teste
    const testUserId = randomUUID();
    const hashedPassword = await bcrypt.hash("senha123", 10);

    console.log("👤 Criando usuário proprietário de teste...");
    await db.insert(users).values({
      id: testUserId,
      name: "João Silva - Proprietário",
      email: "proprietario@siloshare.com",
      password: hashedPassword,
      telefone: "(66) 99999-9999",
      role: "user",
      tipoUsuario: "dono_silo",
      verificado: 1,
      emailVerificado: 1,
      celularVerificado: 0,
      avaliacaoMedia: 4.8,
      totalAvaliacoes: 25,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    });

    console.log(`✅ Usuário criado: João Silva (proprietario@siloshare.com)\n`);

    // Dados dos silos de teste
    const silosData = [
      {
        userId: testUserId,
        nome: "Silo Agrícola Boa Esperança",
        tipo: "metalico",
        endereco: "Rodovia BR-163, Km 750",
        cidade: "Sorriso",
        estado: "MT",
        latitude: "-12.5419",
        longitude: "-55.7264",
        capacidadeTotal: 10000,
        capacidadeDisponivel: 7500,
        preco: 28.50,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify(["Secagem", "Monitoramento 24/7"]),
        descricao:
          "Silo metálico de alta capacidade localizado na BR-163, próximo a Sorriso/MT. Estrutura moderna com sistema completo de secagem e monitoramento 24h.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUserId,
        nome: "Armazém Central MT",
        tipo: "graneleiro",
        endereco: "Avenida das Indústrias, 1500",
        cidade: "Lucas do Rio Verde",
        estado: "MT",
        latitude: "-13.0539",
        longitude: "-55.9087",
        capacidadeTotal: 15000,
        capacidadeDisponivel: 12000,
        preco: 25.00,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho", "Algodão"]),
        infraestrutura: JSON.stringify([
          "Secagem",
          "Limpeza",
          "Aeração",
          "Monitoramento 24/7",
        ]),
        descricao:
          "Armazém graneleiro de grande porte com infraestrutura completa. Localizado em Lucas do Rio Verde, oferece todos os serviços necessários.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUserId,
        nome: "Silo Fazenda São José",
        tipo: "metalico",
        endereco: "Fazenda São José, Zona Rural",
        cidade: "Primavera do Leste",
        estado: "MT",
        latitude: "-15.5561",
        longitude: "-54.2961",
        capacidadeTotal: 8000,
        capacidadeDisponivel: 5000,
        preco: 30.00,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify(["Secagem", "Monitoramento 24/7"]),
        descricao:
          "Silo metálico particular localizado em fazenda produtiva. Acesso facilitado pela MT-130. Sistema de secagem próprio e monitoramento remoto.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUserId,
        nome: "Cooperativa Agrícola Central",
        tipo: "graneleiro",
        endereco: "Rodovia BR-163, Km 850",
        cidade: "Sinop",
        estado: "MT",
        latitude: "-11.8609",
        longitude: "-55.5050",
        capacidadeTotal: 25000,
        capacidadeDisponivel: 18000,
        preco: 22.00,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho", "Trigo", "Sorgo"]),
        infraestrutura: JSON.stringify([
          "Secagem",
          "Limpeza",
          "Aeração",
          "Monitoramento 24/7",
          "Balança",
          "Laboratório",
        ]),
        descricao:
          "Maior cooperativa da região norte de Mato Grosso. Infraestrutura completa com laboratório de análise, balança rodoviária e sistema de classificação automatizado.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUserId,
        nome: "Silo Agroindustrial Campo Verde",
        tipo: "metalico",
        endereco: "Rodovia MT-407, Km 12",
        cidade: "Campo Verde",
        estado: "MT",
        latitude: "-15.5447",
        longitude: "-55.1636",
        capacidadeTotal: 12000,
        capacidadeDisponivel: 9000,
        preco: 26.50,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify([
          "Secagem",
          "Limpeza",
          "Monitoramento 24/7",
        ]),
        descricao:
          "Silo moderno com tecnologia de ponta. Localização estratégica próxima às principais rodovias. Sistema de secagem eficiente e limpeza mecanizada.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUserId,
        nome: "Armazém Grãos do Norte",
        tipo: "graneleiro",
        endereco: "Avenida Perimetral Norte, 2500",
        cidade: "Alta Floresta",
        estado: "MT",
        latitude: "-9.8756",
        longitude: "-56.0861",
        capacidadeTotal: 18000,
        capacidadeDisponivel: 15000,
        preco: 24.00,
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho", "Arroz"]),
        infraestrutura: JSON.stringify(["Secagem", "Limpeza", "Aeração"]),
        descricao:
          "Armazém estrategicamente localizado no norte do estado. Atende produtores de Alta Floresta e região. Infraestrutura adequada para grandes volumes.",
        status: "aprovado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Inserir silos
    console.log(`📦 Inserindo ${silosData.length} silos...\n`);
    for (const siloData of silosData) {
      try {
        const [silo] = await db.insert(silos).values(siloData).returning();
        console.log(
          `✅ Silo #${silo.id}: ${silo.nome} (${silo.cidade}/${silo.estado})`
        );
      } catch (error) {
        console.error(`❌ Erro ao criar silo "${siloData.nome}":`, error);
      }
    }

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log(`\n📊 Resumo:`);
    console.log(`   - 1 usuário proprietário criado`);
    console.log(`   - ${silosData.length} silos cadastrados`);
    console.log(`\n🔐 Credenciais de teste:`);
    console.log(`   E-mail: proprietario@siloshare.com`);
    console.log(`   Senha: senha123`);
  } catch (error) {
    console.error("\n❌ Erro ao executar seed:", error);
    throw error;
  }
}

// Executar seed
seedDatabase()
  .then(() => {
    console.log("\n✅ Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Falha no processo:", error);
    process.exit(1);
  });
