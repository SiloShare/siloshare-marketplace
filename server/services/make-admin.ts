import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.log("Uso: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  try {
    const db = await getDb();
    if (!db) {
      console.log("❌ Não foi possível conectar ao banco de dados");
      process.exit(1);
    }
    
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email));

    // Verificar se o usuário foi atualizado
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.log(`❌ Usuário com email ${email} não encontrado`);
    } else {
      console.log(`✅ Usuário ${email} agora é ADMIN!`);
      console.log(`Role: ${user.role}`);
      console.log(`Acesse: /admin`);
    }
  } catch (error) {
    console.error("Erro:", error);
  }
  
  process.exit(0);
}

makeAdmin();

