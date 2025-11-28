import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { pagamentos, reservas, silos, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

// Stripe configurado e ativo!
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Criar sessão de checkout do Stripe
 */
export async function createCheckoutSession(data: {
  reservaId: number;
  userId: string;
  valor: number;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    // Buscar informações da reserva
    const [reserva] = await db
      .select({
        id: reservas.id,
        siloId: reservas.siloId,
        capacidade: reservas.capacidade,
        dataInicio: reservas.dataInicio,
        dataFim: reservas.dataFim,
        siloNome: silos.nome,
      })
      .from(reservas)
      .leftJoin(silos, eq(reservas.siloId, silos.id))
      .where(eq(reservas.id, data.reservaId));

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    // Criar registro de pagamento pendente
    const [pagamento] = await db
      .insert(pagamentos)
      .values({
        reservaId: data.reservaId,
        userId: data.userId,
        valor: data.valor,
        status: 'pending',
        metadata: JSON.stringify({
          siloNome: reserva.siloNome,
          capacidade: reserva.capacidade,
          dataInicio: reserva.dataInicio,
          dataFim: reserva.dataFim,
        }),
      })
      .returning();

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Reserva de Silo - ${reserva.siloNome}`,
              description: `${reserva.capacidade} toneladas de ${reserva.dataInicio} até ${reserva.dataFim}`,
            },
            unit_amount: Math.round(data.valor * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        reservaId: data.reservaId.toString(),
        pagamentoId: pagamento.id.toString(),
        userId: data.userId,
      },
    });

    // Atualizar pagamento com session ID
    await db
      .update(pagamentos)
      .set({ stripeSessionId: session.id })
      .where(eq(pagamentos.id, pagamento.id));

    console.log('✅ Sessão de checkout criada com sucesso!');
    console.log(`💳 Session ID: ${session.id}`);
    console.log(`🔗 URL: ${session.url}`);

    return {
      sessionId: session.id,
      url: session.url,
      pagamentoId: pagamento.id,
    };
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

/**
 * Processar webhook do Stripe
 */
export async function handleStripeWebhook(event: any) {
  try {
    console.log('🔔 Webhook recebido:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    throw error;
  }
}

/**
 * Processar checkout completado
 */
async function handleCheckoutCompleted(session: any) {
  try {
    const reservaId = parseInt(session.metadata.reservaId);
    const pagamentoId = parseInt(session.metadata.pagamentoId);

    // Atualizar pagamento
    await db
      .update(pagamentos)
      .set({
        status: 'paid',
        stripePaymentIntentId: session.payment_intent,
        paidAt: new Date(),
      })
      .where(eq(pagamentos.id, pagamentoId));

    // Atualizar status da reserva para confirmada
    await db
      .update(reservas)
      .set({ status: 'confirmada' })
      .where(eq(reservas.id, reservaId));

    console.log(`✅ Pagamento ${pagamentoId} confirmado para reserva ${reservaId}`);

    // TODO: Enviar e-mail de confirmação de pagamento
  } catch (error) {
    console.error('❌ Erro ao processar checkout completado:', error);
    throw error;
  }
}

/**
 * Processar pagamento bem-sucedido
 */
async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    // Buscar pagamento pelo payment intent ID
    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.stripePaymentIntentId, paymentIntent.id));

    if (pagamento) {
      await db
        .update(pagamentos)
        .set({
          status: 'paid',
          paidAt: new Date(),
        })
        .where(eq(pagamentos.id, pagamento.id));

      console.log(`✅ Pagamento ${pagamento.id} marcado como pago`);
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento bem-sucedido:', error);
    throw error;
  }
}

/**
 * Processar pagamento falhado
 */
async function handlePaymentFailed(paymentIntent: any) {
  try {
    // Buscar pagamento pelo payment intent ID
    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.stripePaymentIntentId, paymentIntent.id));

    if (pagamento) {
      await db
        .update(pagamentos)
        .set({ status: 'failed' })
        .where(eq(pagamentos.id, pagamento.id));

      console.log(`❌ Pagamento ${pagamento.id} falhou`);
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento falhado:', error);
    throw error;
  }
}

/**
 * Buscar pagamentos de uma reserva
 */
export async function getPagamentosByReserva(reservaId: number) {
  try {
    const reservaPagamentos = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.reservaId, reservaId));

    return reservaPagamentos;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos:', error);
    throw error;
  }
}

/**
 * Buscar pagamentos de um usuário
 */
export async function getPagamentosByUser(userId: string) {
  try {
    const userPagamentos = await db
      .select({
        id: pagamentos.id,
        reservaId: pagamentos.reservaId,
        valor: pagamentos.valor,
        status: pagamentos.status,
        createdAt: pagamentos.createdAt,
        paidAt: pagamentos.paidAt,
        metadata: pagamentos.metadata,
      })
      .from(pagamentos)
      .where(eq(pagamentos.userId, userId))
      .orderBy(pagamentos.createdAt);

    return userPagamentos;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos do usuário:', error);
    throw error;
  }
}
