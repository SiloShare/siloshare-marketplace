/**
 * Configuração do Stripe
 * Processamento de pagamentos para contratos de armazenagem
 */

export const stripeConfig = {
  // Chaves da API (obter em https://dashboard.stripe.com/apikeys)
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  
  // Webhook secret (para verificar eventos)
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  
  // Configurações de pagamento
  currency: "brl", // Real brasileiro
  paymentMethods: ["card", "boleto", "pix"], // Métodos aceitos
  
  // Taxa da plataforma (5% sobre cada transação)
  platformFeePercent: 5,
  
  // Configurações de assinatura recorrente
  subscriptionConfig: {
    billingCycleAnchor: "month_start", // Cobrar no início do mês
    collectionMethod: "charge_automatically", // Cobrar automaticamente
    daysUntilDue: 7, // 7 dias para pagar boleto
  },
};

/**
 * Verifica se o Stripe está configurado
 */
export function isStripeConfigured(): boolean {
  return !!(stripeConfig.publishableKey && stripeConfig.secretKey);
}

/**
 * Calcula taxa da plataforma
 */
export function calcularTaxaPlataforma(valor: number): number {
  return valor * (stripeConfig.platformFeePercent / 100);
}

/**
 * Calcula valor líquido para o fornecedor (após taxa)
 */
export function calcularValorLiquido(valor: number): number {
  return valor - calcularTaxaPlataforma(valor);
}

