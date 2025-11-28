import { createSilo, upsertUser, getUser } from "../server/db";
import type { InsertSilo, InsertUser } from "../drizzle/schema";

async function seedSilos() {
  console.log("🌱 Populando banco de dados com silos de teste...\n");

  try {
    // Criar usuário de teste
    const testUserId = "test-proprietario-123";
    const testUser: InsertUser = {
      id: testUserId,
      name: "João Silva - Proprietário",
      email: "proprietario@siloshare.com",
      telefone: "(66) 99999-9999",
      role: "user",
      tipoUsuario: "dono_silo",
    };

    console.log("👤 Criando/atualizando usuário de teste...");
    await upsertUser(testUser);
    const user = await getUser(testUserId);
    if (!user) {
      throw new Error("Falha ao criar usuário de teste");
    }
    console.log(`✅ Usuário: ${user.name} (${user.email})\n`);

    // Dados dos silos de teste
    const silosData: InsertSilo[] = [
      {
        userId: testUserId,
        nome: "Silo Agrícola Boa Esperança",
        tipo: "metalico",
        endereco: "Rodovia BR-163, Km 750",
        cidade: "Sorriso",
        estado: "MT",
        latitude: "-12.5419",
        longitude: "-55.7264",
        capacidadeTotal: "10000",
        capacidadeDisponivel: "7500",
        precoTonMes: "28.50",
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify(["Secagem", "Monitoramento 24/7"]),
        descricao:
          "Silo metálico de alta capacidade localizado na BR-163, próximo a Sorriso/MT. Estrutura moderna com sistema completo de secagem e monitoramento 24h.",
        status: "aprovado",
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
        capacidadeTotal: "15000",
        capacidadeDisponivel: "12000",
        precoTonMes: "25.00",
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho", "Algodão"]),
        infraestrutura: JSON.stringify(["Secagem", "Limpeza", "Aeração", "Monitoramento 24/7"]),
        descricao:
          "Armazém graneleiro de grande porte com infraestrutura completa. Localizado em Lucas do Rio Verde, oferece todos os serviços necessários.",
        status: "aprovado",
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
        capacidadeTotal: "8000",
        capacidadeDisponivel: "5000",
        precoTonMes: "30.00",
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify(["Secagem", "Monitoramento 24/7"]),
        descricao:
          "Silo metálico particular localizado em fazenda produtiva. Acesso facilitado pela MT-130. Sistema de secagem próprio e monitoramento remoto.",
        status: "aprovado",
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
        capacidadeTotal: "25000",
        capacidadeDisponivel: "18000",
        precoTonMes: "22.00",
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
        capacidadeTotal: "12000",
        capacidadeDisponivel: "9000",
        precoTonMes: "26.50",
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho"]),
        infraestrutura: JSON.stringify(["Secagem", "Limpeza", "Monitoramento 24/7"]),
        descricao:
          "Silo moderno com tecnologia de ponta. Localização estratégica próxima às principais rodovias. Sistema de secagem eficiente e limpeza mecanizada.",
        status: "aprovado",
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
        capacidadeTotal: "18000",
        capacidadeDisponivel: "15000",
        precoTonMes: "24.00",
        tiposGraosAceitos: JSON.stringify(["Soja", "Milho", "Arroz"]),
        infraestrutura: JSON.stringify(["Secagem", "Limpeza", "Aeração"]),
        descricao:
          "Armazém estrategicamente localizado no norte do estado. Atende produtores de Alta Floresta e região. Infraestrutura adequada para grandes volumes.",
        status: "aprovado",
      },
    ];

    // Inserir silos
    console.log(`📦 Inserindo ${silosData.length} silos...\n`);
    for (const siloData of silosData) {
      try {
        const silo = await createSilo(siloData);
        console.log(`✅ Silo #${silo.id}: ${silo.nome} (${silo.cidade}/${silo.estado})`);
      } catch (error) {
        console.error(`❌ Erro ao criar silo "${siloData.nome}":`, error);
      }
    }

    console.log("\n🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro ao executar seed:", error);
    throw error;
  }
}

// Executar seed
seedSilos()
  .then(() => {
    console.log("\n✅ Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Falha no processo:", error);
    process.exit(1);
  });

