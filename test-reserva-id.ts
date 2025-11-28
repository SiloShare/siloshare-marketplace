import { createReserva } from "./server/db-reservas";

async function testReservaId() {
  console.log("🧪 Testando retorno do ID da reserva...\n");

  try {
    const novaReserva = await createReserva({
      siloId: 2,
      produtorId: "test-user-id",
      capacidadeReservada: 1000,
      dataInicio: new Date("2025-02-01"),
      dataFim: new Date("2025-07-01"),
      valorTotal: 125000,
    });

    console.log("✅ Reserva criada com sucesso!");
    console.log(`   ID da Reserva: ${novaReserva.id}`);
    console.log("");

    if (novaReserva.id) {
      console.log("🎉 SUCESSO: A função createReserva está retornando o ID corretamente!");
    } else {
      console.log("❌ FALHA: O ID não foi retornado.");
    }
  } catch (error: any) {
    console.error("❌ Erro ao criar reserva:", error.message);
  }
}

testReservaId().catch(console.error);
