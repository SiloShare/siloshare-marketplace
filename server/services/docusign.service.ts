/**
 * Serviço de integração com DocuSign
 * Gerencia envio de envelopes, assinaturas e webhooks
 */

import { docusignConfig, getDocuSignApiUrl } from "../config/docusign";

interface SignerInfo {
  name: string;
  email: string;
  clientUserId?: string; // Para assinatura embarcada
}

interface DocumentInfo {
  name: string;
  documentBase64: string;
  documentId: string;
  fileExtension: string;
}

interface EnvelopeRequest {
  emailSubject: string;
  documents: DocumentInfo[];
  recipients: {
    signers: SignerInfo[];
  };
  status: "sent" | "created"; // sent = envia imediatamente, created = rascunho
}

/**
 * Obtém token de acesso OAuth 2.0
 */
async function getAccessToken(): Promise<string> {
  const { integrationKey, secretKey, baseUri } = docusignConfig;
  
  const authUrl = `${baseUri}/oauth/token`;
  const credentials = Buffer.from(`${integrationKey}:${secretKey}`).toString("base64");
  
  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=signature",
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao obter token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro ao obter token do DocuSign:", error);
    throw error;
  }
}

/**
 * Cria e envia um envelope para assinatura
 */
export async function criarEnvelope(request: EnvelopeRequest): Promise<string> {
  const accessToken = await getAccessToken();
  const apiUrl = `${getDocuSignApiUrl()}/envelopes`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro ao criar envelope:", errorData);
      throw new Error(`Erro ao criar envelope: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.envelopeId;
  } catch (error) {
    console.error("Erro ao criar envelope no DocuSign:", error);
    throw error;
  }
}

/**
 * Cria envelope de contrato de armazenagem
 */
export async function criarContratoArmazenagem(dados: {
  clienteNome: string;
  clienteEmail: string;
  fornecedorNome: string;
  fornecedorEmail: string;
  siloNome: string;
  capacidade: number;
  preco: number;
  periodo: string;
}): Promise<string> {
  // Gera o PDF do contrato (simplificado - em produção usar template)
  const contratoHTML = gerarHTMLContrato(dados);
  const contratoBase64 = Buffer.from(contratoHTML).toString("base64");
  
  const envelopeRequest: EnvelopeRequest = {
    emailSubject: `Contrato de Armazenagem - ${dados.siloNome}`,
    documents: [
      {
        documentBase64: contratoBase64,
        name: "Contrato de Armazenagem",
        fileExtension: "html",
        documentId: "1",
      },
    ],
    recipients: {
      signers: [
        {
          email: dados.clienteEmail,
          name: dados.clienteNome,
          clientUserId: "cliente-1", // Para assinatura embarcada
        },
        {
          email: dados.fornecedorEmail,
          name: dados.fornecedorNome,
          clientUserId: "fornecedor-1",
        },
      ],
    },
    status: "sent",
  };
  
  return await criarEnvelope(envelopeRequest);
}

/**
 * Cria envelope de contrato de fornecedor
 */
export async function criarContratoFornecedor(dados: {
  fornecedorNome: string;
  fornecedorEmail: string;
  siloNome: string;
  cnpj: string;
}): Promise<string> {
  const contratoHTML = gerarHTMLContratoFornecedor(dados);
  const contratoBase64 = Buffer.from(contratoHTML).toString("base64");
  
  const envelopeRequest: EnvelopeRequest = {
    emailSubject: `Contrato de Parceria - SiloShare`,
    documents: [
      {
        documentBase64: contratoBase64,
        name: "Contrato de Parceria",
        fileExtension: "html",
        documentId: "1",
      },
    ],
    recipients: {
      signers: [
        {
          email: dados.fornecedorEmail,
          name: dados.fornecedorNome,
          clientUserId: "fornecedor-1",
        },
      ],
    },
    status: "sent",
  };
  
  return await criarEnvelope(envelopeRequest);
}

/**
 * Obtém URL de assinatura embarcada
 */
export async function obterUrlAssinatura(
  envelopeId: string,
  signerEmail: string,
  returnUrl: string
): Promise<string> {
  const accessToken = await getAccessToken();
  const apiUrl = `${getDocuSignApiUrl()}/envelopes/${envelopeId}/views/recipient`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        returnUrl,
        authenticationMethod: "none",
        email: signerEmail,
        userName: signerEmail,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao obter URL de assinatura: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Erro ao obter URL de assinatura:", error);
    throw error;
  }
}

/**
 * Verifica status de um envelope
 */
export async function verificarStatusEnvelope(envelopeId: string): Promise<{
  status: string;
  sentDateTime: string;
  completedDateTime?: string;
}> {
  const accessToken = await getAccessToken();
  const apiUrl = `${getDocuSignApiUrl()}/envelopes/${envelopeId}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao verificar status do envelope:", error);
    throw error;
  }
}

/**
 * Gera HTML do contrato de armazenagem
 */
function gerarHTMLContrato(dados: {
  clienteNome: string;
  fornecedorNome: string;
  siloNome: string;
  capacidade: number;
  preco: number;
  periodo: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Armazenagem</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    .section { margin: 20px 0; }
    .signature { margin-top: 60px; border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>CONTRATO DE ARMAZENAGEM DE GRÃOS</h1>
  
  <div class="section">
    <h2>PARTES CONTRATANTES</h2>
    <p><strong>CONTRATANTE:</strong> ${dados.clienteNome}</p>
    <p><strong>CONTRATADO:</strong> ${dados.fornecedorNome}</p>
  </div>
  
  <div class="section">
    <h2>OBJETO DO CONTRATO</h2>
    <p>O presente contrato tem por objeto a prestação de serviços de armazenagem de grãos no silo <strong>${dados.siloNome}</strong>.</p>
  </div>
  
  <div class="section">
    <h2>CONDIÇÕES</h2>
    <p><strong>Capacidade contratada:</strong> ${dados.capacidade.toLocaleString('pt-BR')} toneladas</p>
    <p><strong>Valor:</strong> R$ ${dados.preco.toFixed(2)} por tonelada/mês</p>
    <p><strong>Período:</strong> ${dados.periodo}</p>
  </div>
  
  <div class="section">
    <h2>RESPONSABILIDADES</h2>
    <p>O CONTRATADO se compromete a manter as condições adequadas de armazenagem, incluindo controle de temperatura, umidade e proteção contra pragas.</p>
    <p>O CONTRATANTE se compromete a efetuar o pagamento nas datas acordadas e fornecer grãos dentro dos padrões de qualidade estabelecidos.</p>
  </div>
  
  <div class="section">
    <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  
  <div class="signature">
    <p>${dados.clienteNome}</p>
    <p>CONTRATANTE</p>
  </div>
  
  <div class="signature">
    <p>${dados.fornecedorNome}</p>
    <p>CONTRATADO</p>
  </div>
</body>
</html>
  `;
}

/**
 * Gera HTML do contrato de fornecedor
 */
function gerarHTMLContratoFornecedor(dados: {
  fornecedorNome: string;
  siloNome: string;
  cnpj: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Parceria - SiloShare</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    .section { margin: 20px 0; }
    .signature { margin-top: 60px; border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>CONTRATO DE PARCERIA - SILOSHARE</h1>
  
  <div class="section">
    <h2>PARTES CONTRATANTES</h2>
    <p><strong>PARCEIRO:</strong> ${dados.fornecedorNome}</p>
    <p><strong>CNPJ:</strong> ${dados.cnpj}</p>
    <p><strong>PLATAFORMA:</strong> SiloShare Marketplace de Armazenagem</p>
  </div>
  
  <div class="section">
    <h2>OBJETO DO CONTRATO</h2>
    <p>O presente contrato tem por objeto a parceria para disponibilização do silo <strong>${dados.siloNome}</strong> na plataforma SiloShare.</p>
  </div>
  
  <div class="section">
    <h2>CONDIÇÕES</h2>
    <p>O PARCEIRO autoriza a SiloShare a intermediar contratos de armazenagem em seu nome.</p>
    <p>A SiloShare cobrará uma taxa de intermediação de 5% sobre o valor de cada contrato.</p>
    <p>O PARCEIRO se compromete a manter as certificações e documentações em dia.</p>
  </div>
  
  <div class="section">
    <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  
  <div class="signature">
    <p>${dados.fornecedorNome}</p>
    <p>PARCEIRO</p>
  </div>
  
  <div class="signature">
    <p>SiloShare Marketplace</p>
    <p>PLATAFORMA</p>
  </div>
</body>
</html>
  `;
}

