import mysql from 'mysql2/promise';

// URLs de fotos reais de silos e armazéns de grãos do Unsplash
const fotosSilos = [
  [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "https://images.unsplash.com/photo-1625246165252-c2e8e3a5a8a1?w=800&q=80",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "https://images.unsplash.com/photo-1625246165252-c2e8e3a5a8a1?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1625246165252-c2e8e3a5a8a1?w=800&q=80",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "https://images.unsplash.com/photo-1625246165252-c2e8e3a5a8a1?w=800&q=80",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    "https://images.unsplash.com/photo-1625246165252-c2e8e3a5a8a1?w=800&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80"
  ]
];

async function addPhotosToSilos() {
  console.log("📸 Adicionando fotos aos silos...");

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    // Buscar todos os silos
    const [rows] = await connection.execute('SELECT id, nome FROM silos');
    const silos = rows as any[];
    
    console.log(`Encontrados ${silos.length} silos`);

    // Atualizar cada silo com fotos
    for (let i = 0; i < silos.length; i++) {
      const silo = silos[i];
      const fotosIndex = i % fotosSilos.length;
      const fotos = fotosSilos[fotosIndex];
      const fotosJson = JSON.stringify(fotos);

      await connection.execute(
        'UPDATE silos SET fotos = ?, imagemUrl = ? WHERE id = ?',
        [fotosJson, fotos[0], silo.id]
      );

      console.log(`✓ Silo ${silo.id} - ${silo.nome}: ${fotos.length} fotos adicionadas`);
    }

    console.log("✅ Fotos adicionadas com sucesso a todos os silos!");
  } catch (error) {
    console.error("❌ Erro ao adicionar fotos:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Executar o script
addPhotosToSilos()
  .then(() => {
    console.log("🎉 Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  });

