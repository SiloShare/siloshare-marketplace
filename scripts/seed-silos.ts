import { db } from "../server/db";
import { silos, users } from "../server/db/schema";
import { eq } from "drizzle-orm";

async function seedSilos() {
  console.log("🌱 Populando banco de dados com silos de teste...");

  try {
    // Verificar se já existe um usuário de teste
    let testUser = await db.query.users.findFirst({
      where: eq(users.email, "proprietario@siloshare.com"),
    });

    // Se não existir, criar usuário de teste
    if (!testUser) {
      console.log("👤 Criando usuário de teste...");
      const [newUser] = await db
        .insert(users)
        .values({
          email: "proprietario@siloshare.com",
          nome: "João Silva",
          telefone: "(66) 99999-9999",
          role: "proprietario",
        })
        .returning();
      testUser = newUser;
      console.log("✅ Usuário de teste criado:", testUser.email);
    } else {
      console.log("✅ Usuário de teste já existe:", testUser.email);
    }

    // Verificar se já existem silos
    const existingSilos = await db.query.silos.findMany();
    if (existingSilos.length > 0) {
      console.log(`⚠️  Já existem ${existingSilos.length} silos no banco de dados.`);
      console.log("Deseja continuar e adicionar mais silos? (Ctrl+C para cancelar)");
    }

    // Dados dos silos de teste
    const silosData = [
      {
        proprietarioId: testUser.id,
        nome: "Silo Agrícola Boa Esperança",
        tipo: "metalico",
        endereco: "Rodovia BR-163, Km 750",
        cidade: "Sorriso",
        estado: "MT",
        cep: "78890-000",
        latitude: "-12.5419",
        longitude: "-55.7264",
        capacidadeTotal: 10000,
        capacidadeDisponivel: 7500,
        precoTonelada: "28.50",
        tiposGraos: JSON.stringify(["Soja", "Milho"]),
        infraSecagem: true,
        infraLimpeza: false,
        infraAeracao: false,
        infraMonitoramento: true,
        descricao:
          "Silo metálico de alta capacidade localizado na BR-163, próximo a Sorriso/MT. Estrutura moderna com sistema completo de secagem e monitoramento 24h. Fácil acesso para carretas. Ideal para grandes volumes de soja e milho.",
        disponivel: true,
      },
      {
        proprietarioId: testUser.id,
        nome: "Armazém Central MT",
        tipo: "armazem",
        endereco: "Avenida das Indústrias, 1500",
        cidade: "Lucas do Rio Verde",
        estado: "MT",
        cep: "78455-000",
        latitude: "-13.0539",
        longitude: "-55.9087",
        capacidadeTotal: 15000,
        capacidadeDisponivel: 12000,
        precoTonelada: "25.00",
        tiposGraos: JSON.stringify(["Soja", "Milho", "Algodão"]),
        infraSecagem: true,
        infraLimpeza: true,
        infraAeracao: true,
        infraMonitoramento: true,
        descricao:
          "Armazém graneleiro de grande porte com infraestrutura completa. Localizado em Lucas do Rio Verde, oferece todos os serviços necessários para armazenagem de grãos com qualidade. Equipe técnica especializada disponível 24h.",
        disponivel: true,
      },
      {
        proprietarioId: testUser.id,
        nome: "Silo Fazenda São José",
        tipo: "metalico",
        endereco: "Fazenda São José, Zona Rural",
        cidade: "Primavera do Leste",
        estado: "MT",
        cep: "78850-000",
        latitude: "-15.5561",
        longitude: "-54.2961",
        capacidadeTotal: 8000,
        capacidadeDisponivel: 5000,
        precoTonelada: "30.00",
        tiposGraos: JSON.stringify(["Soja", "Milho"]),
        infraSecagem: true,
        infraLimpeza: false,
        infraAeracao: false,
        infraMonitoramento: true,
        descricao:
          "Silo metálico particular localizado em fazenda produtiva. Acesso facilitado pela MT-130. Sistema de secagem próprio e monitoramento remoto. Ideal para produtores da região de Primavera do Leste.",
        disponivel: true,
      },
      {
        proprietarioId: testUser.id,
        nome: "Cooperativa Agrícola Central",
        tipo: "armazem",
        endereco: "Rodovia BR-163, Km 850",
        cidade: "Sinop",
        estado: "MT",
        cep: "78550-000",
        latitude: "-11.8609",
        longitude: "-55.5050",
        capacidadeTotal: 25000,
        capacidadeDisponivel: 18000,
        precoTonelada: "22.00",
        tiposGraos: JSON.stringify(["Soja", "Milho", "Trigo", "Sorgo"]),
        infraSecagem: true,
        infraLimpeza: true,
        infraAeracao: true,
        infraMonitoramento: true,
        descricao:
          "Maior cooperativa da região norte de Mato Grosso. Infraestrutura completa com laboratório de análise, balança rodoviária e sistema de classificação automatizado. Atende produtores de toda a região com excelência.",
        disponivel: true,
      },
      {
        proprietarioId: testUser.id,
        nome: "Silo Agroindustrial Campo Verde",
        tipo: "metalico",
        endereco: "Rodovia MT-407, Km 12",
        cidade: "Campo Verde",
        estado: "MT",
        cep: "78840-000",
        latitude: "-15.5447",
        longitude: "-55.1636",
        capacidadeTotal: 12000,
        capacidadeDisponivel: 9000,
        precoTonelada: "26.50",
        tiposGraos: JSON.stringify(["Soja", "Milho"]),
        infraSecagem: true,
        infraLimpeza: true,
        infraAeracao: false,
        infraMonitoramento: true,
        descricao:
          "Silo moderno com tecnologia de ponta. Localização estratégica próxima às principais rodovias. Sistema de secagem eficiente e limpeza mecanizada. Ótima opção para produtores da região de Campo Verde.",
        disponivel: true,
      },
      {
        proprietarioId: testUser.id,
        nome: "Armazém Grãos do Norte",
        tipo: "armazem",
        endereco: "Avenida Perimetral Norte, 2500",
        cidade: "Alta Floresta",
        estado: "MT",
        cep: "78580-000",
        latitude: "-9.8756",
        longitude: "-56.0861",
        capacidadeTotal: 18000,
        capacidadeDisponivel: 15000,
        precoTonelada: "24.00",
        tiposGraos: JSON.stringify(["Soja", "Milho", "Arroz"]),
        infraSecagem: true,
        infraLimpeza: true,
        infraAeracao: true,
        infraMonitoramento: false,
        descricao:
          "Armazém estrategicamente localizado no norte do estado. Atende produtores de Alta Floresta e região. Infraestrutura adequada para grandes volumes. Acesso facilitado para caminhões de grande porte.",
        disponivel: true,
      },
    ];

    // Inserir silos
    console.log(`\n📦 Inserindo ${silosData.length} silos...`);
    for (const siloData of silosData) {
      const [silo] = await db.insert(silos).values(siloData).returning();
      console.log(`✅ Silo criado: ${silo.nome} (${silo.cidade}/${silo.estado})`);
    }

    console.log("\n🎉 Banco de dados populado com sucesso!");
    console.log(`\n📊 Total de silos no banco: ${(await db.query.silos.findMany()).length}`);
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
    throw error;
  }
}

// Executar seed
seedSilos()
  .then(() => {
    console.log("\n✅ Seed concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro ao executar seed:", error);
    process.exit(1);
  });

