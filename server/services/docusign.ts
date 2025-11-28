/**
 * Configuração do DocuSign
 * Credenciais da conta de produção
 */

export const docusignConfig = {
  // Informações da conta
  userId: "b722146d-66b6-4710-a574-5c3dba15f820",
  accountId: "b94c29c7-a4c9-4c5f-94ec-6cflacde2259",
  baseUri: "https://na4.docusign.net",
  
  // OAuth 2.0 (configurar no painel do DocuSign)
  integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || "",
  secretKey: process.env.DOCUSIGN_SECRET_KEY || "",
  
  // Redirect URI para OAuth
  redirectUri: process.env.DOCUSIGN_REDIRECT_URI || "http://localhost:3000/auth/docusign/callback",
  
  // Configurações de assinatura
  defaultSignerName: "Signatário",
  defaultSignerEmail: "assinante@example.com",
  
  // Templates de contrato
  templates: {
    armazenagem: process.env.DOCUSIGN_TEMPLATE_ARMAZENAGEM || "",
    fornecedor: process.env.DOCUSIGN_TEMPLATE_FORNECEDOR || "",
  },
  
  // Configurações de webhook
  webhookUrl: process.env.DOCUSIGN_WEBHOOK_URL || "https://api.siloshare.com/webhooks/docusign",
};

/**
 * Verifica se as credenciais do DocuSign estão configuradas
 */
export function isDocuSignConfigured(): boolean {
  return !!(
    docusignConfig.userId &&
    docusignConfig.accountId &&
    docusignConfig.integrationKey &&
    docusignConfig.secretKey
  );
}

/**
 * Retorna a URL base da API do DocuSign
 */
export function getDocuSignApiUrl(): string {
  return `${docusignConfig.baseUri}/restapi/v2.1/accounts/${docusignConfig.accountId}`;
}

