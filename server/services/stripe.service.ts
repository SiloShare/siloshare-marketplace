/**
 * Serviço de integração com Stripe
 * Gerencia pagamentos, assinaturas e transferências
 */

import Stripe from "stripe";
import { stripeConfig, calcularTaxaPlataforma } from "../config/stripe";

// Inicializar cliente Stripe
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: "2024-12-18.acacia",
});

interface CriarPagamentoParams {
  valor: number; // Em reais
  descricao: string;
  clienteEmail: string;
  clienteNome: string;
  metadata?: Record<string, string>;
}

interface CriarAssinaturaParams {
  valorMensal: number;
  clienteEmail: string;
  clienteNome: string;
  siloId: number;
  siloNome: string;
  meses: number;
}

/**
 * Cria um Payment Intent para pagamento único
 */
export async function criarPagamento(params: CriarPagamentoParams): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  const { valor, descricao, clienteEmail, clienteNome, metadata } = params;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100), // Converter para centavos
      currency: stripeConfig.currency,
      description: descricao,
      receipt_email: clienteEmail,
      metadata: {
        cliente_nome: clienteNome,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Erro ao criar pagamento no Stripe:", error);
    throw error;
  }
}

/**
 * Cria uma assinatura recorrente para armazenagem mensal
 */
export async function criarAssinatura(params: CriarAssinaturaParams): Promise<{
  subscriptionId: string;
  clientSecret: string;
}> {
  const { valorMensal, clienteEmail, clienteNome, siloId, siloNome, meses } = params;
  
  try {
    // 1. Criar ou recuperar cliente
    const customer = await stripe.customers.create({
      email: clienteEmail,
      name: clienteNome,
      metadata: {
        silo_id: siloId.toString(),
        silo_nome: siloNome,
      },
    });
    
    // 2. Criar produto (silo)
    const product = await stripe.products.create({
      name: `Armazenagem - ${siloNome}`,
      description: `Armazenagem mensal no silo ${siloNome}`,
      metadata: {
        silo_id: siloId.toString(),
      },
    });
    
    // 3. Criar preço recorrente
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(valorMensal * 100), // Centavos
      currency: stripeConfig.currency,
      recurring: {
        interval: "month",
        interval_count: 1,
      },
    });
    
    // 4. Criar assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card", "boleto"],
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        silo_id: siloId.toString(),
        silo_nome: siloNome,
        duracao_meses: meses.toString(),
      },
    });
    
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    
    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret!,
    };
  } catch (error) {
    console.error("Erro ao criar assinatura no Stripe:", error);
    throw error;
  }
}

/**
 * Cria pagamento PIX
 */
export async function criarPagamentoPix(params: CriarPagamentoParams): Promise<{
  clientSecret: string;
  pixCode: string;
  pixQrCode: string;
}> {
  const { valor, descricao, clienteEmail, clienteNome, metadata } = params;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100),
      currency: stripeConfig.currency,
      description: descricao,
      receipt_email: clienteEmail,
      payment_method_types: ["pix"],
      metadata: {
        cliente_nome: clienteNome,
        ...metadata,
      },
    });
    
    // Obter dados do PIX
    const charges = await stripe.charges.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });
    
    const pixData = charges.data[0]?.payment_method_details?.pix;
    
    return {
      clientSecret: paymentIntent.client_secret!,
      pixCode: pixData?.qr_code || "",
      pixQrCode: pixData?.qr_code_url || "",
    };
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error);
    throw error;
  }
}

/**
 * Cria pagamento com Boleto
 */
export async function criarPagamentoBoleto(params: CriarPagamentoParams): Promise<{
  clientSecret: string;
  boletoUrl: string;
  boletoBarcode: string;
}> {
  const { valor, descricao, clienteEmail, clienteNome, metadata } = params;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100),
      currency: stripeConfig.currency,
      description: descricao,
      receipt_email: clienteEmail,
      payment_method_types: ["boleto"],
      payment_method_options: {
        boleto: {
          expires_after_days: 7, // Boleto válido por 7 dias
        },
      },
      metadata: {
        cliente_nome: clienteNome,
        ...metadata,
      },
    });
    
    // Obter dados do boleto
    const charges = await stripe.charges.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });
    
    const boletoData = charges.data[0]?.payment_method_details?.boleto;
    
    return {
      clientSecret: paymentIntent.client_secret!,
      boletoUrl: boletoData?.pdf || "",
      boletoBarcode: boletoData?.barcode || "",
    };
  } catch (error) {
    console.error("Erro ao criar boleto:", error);
    throw error;
  }
}

/**
 * Cria transferência para fornecedor (após taxa da plataforma)
 */
export async function criarTransferencia(
  fornecedorStripeAccountId: string,
  valor: number,
  descricao: string
): Promise<string> {
  try {
    const taxaPlataforma = calcularTaxaPlataforma(valor);
    const valorLiquido = valor - taxaPlataforma;
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(valorLiquido * 100),
      currency: stripeConfig.currency,
      destination: fornecedorStripeAccountId,
      description: descricao,
      metadata: {
        valor_bruto: valor.toString(),
        taxa_plataforma: taxaPlataforma.toString(),
        valor_liquido: valorLiquido.toString(),
      },
    });
    
    return transfer.id;
  } catch (error) {
    console.error("Erro ao criar transferência:", error);
    throw error;
  }
}

/**
 * Cria conta conectada para fornecedor (Stripe Connect)
 */
export async function criarContaFornecedor(dados: {
  email: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
}): Promise<string> {
  try {
    const account = await stripe.accounts.create({
      type: "express", // Conta Express (mais simples)
      country: "BR",
      email: dados.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual", // ou "company" para CNPJ
      individual: {
        email: dados.email,
        first_name: dados.nome.split(" ")[0],
        last_name: dados.nome.split(" ").slice(1).join(" "),
        phone: dados.telefone,
      },
      metadata: {
        cpf_cnpj: dados.cpfCnpj,
      },
    });
    
    return account.id;
  } catch (error) {
    console.error("Erro ao criar conta de fornecedor:", error);
    throw error;
  }
}

/**
 * Gera link de onboarding para fornecedor configurar conta
 */
export async function gerarLinkOnboarding(accountId: string): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.APP_URL}/painel-fornecedor/stripe/refresh`,
      return_url: `${process.env.APP_URL}/painel-fornecedor/stripe/success`,
      type: "account_onboarding",
    });
    
    return accountLink.url;
  } catch (error) {
    console.error("Erro ao gerar link de onboarding:", error);
    throw error;
  }
}

/**
 * Verifica status de pagamento
 */
export async function verificarStatusPagamento(paymentIntentId: string): Promise<{
  status: string;
  valor: number;
  pago: boolean;
}> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      status: paymentIntent.status,
      valor: paymentIntent.amount / 100, // Converter de centavos
      pago: paymentIntent.status === "succeeded",
    };
  } catch (error) {
    console.error("Erro ao verificar status de pagamento:", error);
    throw error;
  }
}

/**
 * Cancela assinatura
 */
export async function cancelarAssinatura(subscriptionId: string): Promise<void> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    throw error;
  }
}

/**
 * Cria reembolso
 */
export async function criarReembolso(
  paymentIntentId: string,
  valor?: number,
  motivo?: string
): Promise<string> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: valor ? Math.round(valor * 100) : undefined, // Reembolso parcial ou total
      reason: motivo as any,
    });
    
    return refund.id;
  } catch (error) {
    console.error("Erro ao criar reembolso:", error);
    throw error;
  }
}

export default stripe;

