import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_demo_key");
const FROM_EMAIL = "SiloShare <admin@siloshare.com.br>";

/**
 * Gera código de verificação de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Template de e-mail de verificação (estilo VTEX)
 */
function getVerificationEmailTemplate(userName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de E-mail - SiloShare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #000000; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #4a4a4a; margin-bottom: 30px; }
    .code-container { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1); }
    .code-label { font-size: 13px; color: #16a34a; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; letter-spacing: 1px; }
    .code { font-size: 42px; font-weight: 700; color: #000; letter-spacing: 8px; font-family: monospace; margin-bottom: 12px; }
    .expiry { font-size: 13px; color: #999; }
    .welcome-message { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .welcome-message-text { font-size: 14px; color: #166534; line-height: 1.6; }
    .footer { padding: 30px 40px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer-text { font-size: 12px; color: #999; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">🌾 SiloShare</span>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Olá, ${userName}!</div>
      <div class="welcome-message">
        <div class="welcome-message-text">🎉 <strong>Bem-vindo à SiloShare!</strong> Estamos felizes em tê-lo conosco. A plataforma que conecta produtores rurais a silos de armazenagem em todo o Brasil.</div>
      </div>
      <div class="message">Para completar seu cadastro e começar a usar a plataforma, use o código de verificação abaixo:</div>
      <div class="code-container">
        <div class="code-label">Seu código de acesso é:</div>
        <div class="code">${code}</div>
        <div class="expiry">Este código expira em 15 minutos</div>
      </div>
      <div class="message" style="font-size: 13px; color: #999;">Se você não solicitou este código, ignore este e-mail.</div>
    </div>
    <div class="footer">
      <div class="footer-text">© ${new Date().getFullYear()} SiloShare. Todos os direitos reservados.</div>
      <div class="footer-text">Conectando produtores rurais a silos de armazenagem em todo o Brasil.</div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendVerificationEmail(email: string, userName: string, code: string) {
  // LOG PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
  console.log(`\n🔐 CÓDIGO DE VERIFICAÇÃO\n`);
  console.log(`📧 E-mail: ${email}`);
  console.log(`👤 Nome: ${userName}`);
  console.log(`🔢 Código: ${code}`);
  console.log(`⏰ Expira em: 15 minutos\n`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Verifique seu e-mail - SiloShare",
      html: getVerificationEmailTemplate(userName, code),
    });
    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Bem-vindo à SiloShare! 🌾",
      html: `<h1>Bem-vindo, ${userName}!</h1><p>Sua conta foi verificada com sucesso.</p>`,
    });
    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro" };
  }
}

/**
 * Template de e-mail de recuperação de senha
 */
function getPasswordResetEmailTemplate(userName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - SiloShare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #000000; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #4a4a4a; margin-bottom: 30px; }
    .code-container { background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1); }
    .code-label { font-size: 13px; color: #16a34a; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; letter-spacing: 1px; }
    .code { font-size: 42px; font-weight: 700; color: #000; letter-spacing: 8px; font-family: monospace; margin-bottom: 12px; }
    .expiry { font-size: 13px; color: #999; }
    .security-notice { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .security-notice-title { font-size: 14px; font-weight: 600; color: #ea580c; margin-bottom: 8px; }
    .security-notice-text { font-size: 13px; color: #9a3412; }
    .footer { padding: 30px 40px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer-text { font-size: 12px; color: #999; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">🌾 SiloShare</span>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Olá, ${userName}!</div>
      <div class="message">Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para criar uma nova senha:</div>
      <div class="code-container">
        <div class="code-label">Seu código de recuperação:</div>
        <div class="code">${code}</div>
        <div class="expiry">⏰ Este código expira em 15 minutos</div>
      </div>
      <div class="security-notice">
        <div class="security-notice-title">🔒 Aviso de Segurança</div>
        <div class="security-notice-text">Se você não solicitou a recuperação de senha, ignore este e-mail e sua senha permanecerá inalterada. Recomendamos que você altere sua senha se suspeitar de atividade não autorizada.</div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">© ${new Date().getFullYear()} SiloShare. Todos os direitos reservados.</div>
      <div class="footer-text">Conectando produtores rurais a silos de armazenagem em todo o Brasil.</div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendPasswordResetEmail(email: string, userName: string, code: string) {
  // LOG PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
  console.log(`\n🔑 CÓDIGO DE RECUPERAÇÃO DE SENHA\n`);
  console.log(`📧 E-mail: ${email}`);
  console.log(`👤 Nome: ${userName}`);
  console.log(`🔢 Código: ${code}`);
  console.log(`⏰ Expira em: 15 minutos\n`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Recuperação de Senha - SiloShare",
      html: getPasswordResetEmailTemplate(userName, code),
    });
    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro" };
  }
}

/**
 * Template de e-mail de aprovação de reserva
 */
function getReservaAprovadaEmailTemplate(
  userName: string,
  siloNome: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number
): string {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Aprovada - SiloShare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #000000; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #4a4a4a; margin-bottom: 30px; }
    .success-banner { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1); }
    .success-icon { font-size: 48px; margin-bottom: 12px; }
    .success-title { font-size: 24px; font-weight: 700; color: #16a34a; margin-bottom: 8px; }
    .success-subtitle { font-size: 14px; color: #166534; }
    .details-container { background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px; }
    .details-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 14px; color: #6b7280; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .highlight-value { color: #16a34a; font-size: 18px; }
    .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .next-steps-title { font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 8px; }
    .next-steps-text { font-size: 13px; color: #1e3a8a; line-height: 1.6; }
    .footer { padding: 30px 40px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer-text { font-size: 12px; color: #999; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">🌾 SiloShare</span>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Olá, ${userName}!</div>
      <div class="success-banner">
        <div class="success-icon">✅</div>
        <div class="success-title">Reserva Aprovada!</div>
        <div class="success-subtitle">Sua reserva foi confirmada pelo proprietário do silo</div>
      </div>
      <div class="message">Temos uma ótima notícia! Sua reserva de armazenagem foi aprovada. Confira os detalhes abaixo:</div>
      <div class="details-container">
        <div class="details-title">📋 Detalhes da Reserva</div>
        <div class="detail-row">
          <span class="detail-label">Silo</span>
          <span class="detail-value">${siloNome}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Capacidade Reservada</span>
          <span class="detail-value">${capacidade.toLocaleString('pt-BR')} toneladas</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Período</span>
          <span class="detail-value">${formatDate(dataInicio)} até ${formatDate(dataFim)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor Total</span>
          <span class="detail-value highlight-value">${formatCurrency(valorTotal)}</span>
        </div>
      </div>
      <div class="next-steps">
        <div class="next-steps-title">📌 Próximos Passos</div>
        <div class="next-steps-text">
          • Acesse sua conta na SiloShare para visualizar todos os detalhes da reserva<br>
          • O proprietário do silo entrará em contato em breve para finalizar os detalhes<br>
          • Prepare a documentação necessária para o armazenamento
        </div>
      </div>
      <div class="message" style="font-size: 13px; color: #999;">Se tiver alguma dúvida, entre em contato conosco através da plataforma.</div>
    </div>
    <div class="footer">
      <div class="footer-text">© ${new Date().getFullYear()} SiloShare. Todos os direitos reservados.</div>
      <div class="footer-text">Conectando produtores rurais a silos de armazenagem em todo o Brasil.</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template de e-mail de rejeição de reserva
 */
function getReservaRejeitadaEmailTemplate(
  userName: string,
  siloNome: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number,
  motivo?: string
): string {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Não Aprovada - SiloShare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #000000; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #4a4a4a; margin-bottom: 30px; }
    .info-banner { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1); }
    .info-icon { font-size: 48px; margin-bottom: 12px; }
    .info-title { font-size: 24px; font-weight: 700; color: #dc2626; margin-bottom: 8px; }
    .info-subtitle { font-size: 14px; color: #991b1b; }
    .details-container { background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px; }
    .details-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 14px; color: #6b7280; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .motivo-container { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .motivo-title { font-size: 14px; font-weight: 600; color: #ea580c; margin-bottom: 8px; }
    .motivo-text { font-size: 13px; color: #9a3412; line-height: 1.6; }
    .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .next-steps-title { font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 8px; }
    .next-steps-text { font-size: 13px; color: #1e3a8a; line-height: 1.6; }
    .footer { padding: 30px 40px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer-text { font-size: 12px; color: #999; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">🌾 SiloShare</span>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Olá, ${userName}!</div>
      <div class="info-banner">
        <div class="info-icon">ℹ️</div>
        <div class="info-title">Reserva Não Aprovada</div>
        <div class="info-subtitle">O proprietário não pôde aprovar sua reserva desta vez</div>
      </div>
      <div class="message">Infelizmente, sua solicitação de reserva não foi aprovada pelo proprietário do silo. A capacidade foi restaurada automaticamente.</div>
      <div class="details-container">
        <div class="details-title">📋 Detalhes da Reserva</div>
        <div class="detail-row">
          <span class="detail-label">Silo</span>
          <span class="detail-value">${siloNome}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Capacidade Solicitada</span>
          <span class="detail-value">${capacidade.toLocaleString('pt-BR')} toneladas</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Período</span>
          <span class="detail-value">${formatDate(dataInicio)} até ${formatDate(dataFim)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor</span>
          <span class="detail-value">${formatCurrency(valorTotal)}</span>
        </div>
      </div>
      ${motivo ? `
      <div class="motivo-container">
        <div class="motivo-title">💬 Motivo da Rejeição</div>
        <div class="motivo-text">${motivo}</div>
      </div>
      ` : ''}
      <div class="next-steps">
        <div class="next-steps-title">📌 O que fazer agora?</div>
        <div class="next-steps-text">
          • Explore outros silos disponíveis na plataforma<br>
          • Ajuste as datas ou capacidade da sua reserva<br>
          • Entre em contato com o proprietário para mais informações
        </div>
      </div>
      <div class="message" style="font-size: 13px; color: #999;">Não desanime! Temos muitas outras opções de silos disponíveis para você.</div>
    </div>
    <div class="footer">
      <div class="footer-text">© ${new Date().getFullYear()} SiloShare. Todos os direitos reservados.</div>
      <div class="footer-text">Conectando produtores rurais a silos de armazenagem em todo o Brasil.</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Enviar e-mail de aprovação de reserva
 */
export async function sendReservaAprovadaEmail(
  email: string,
  userName: string,
  siloNome: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number
) {
  // LOG PARA DESENVOLVIMENTO
  console.log(`\n✅ E-MAIL: RESERVA APROVADA\n`);
  console.log(`📧 Para: ${email}`);
  console.log(`👤 Cliente: ${userName}`);
  console.log(`🏢 Silo: ${siloNome}`);
  console.log(`📦 Capacidade: ${capacidade} ton`);
  console.log(`💰 Valor: R$ ${valorTotal.toLocaleString('pt-BR')}\n`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "✅ Sua Reserva foi Aprovada! - SiloShare",
      html: getReservaAprovadaEmailTemplate(userName, siloNome, capacidade, dataInicio, dataFim, valorTotal),
    });
    
    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ E-mail enviado com sucesso!');
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Enviar e-mail de rejeição de reserva
 */
export async function sendReservaRejeitadaEmail(
  email: string,
  userName: string,
  siloNome: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number,
  motivo?: string
) {
  // LOG PARA DESENVOLVIMENTO
  console.log(`\n❌ E-MAIL: RESERVA REJEITADA\n`);
  console.log(`📧 Para: ${email}`);
  console.log(`👤 Cliente: ${userName}`);
  console.log(`🏢 Silo: ${siloNome}`);
  console.log(`📦 Capacidade: ${capacidade} ton`);
  console.log(`💰 Valor: R$ ${valorTotal.toLocaleString('pt-BR')}`);
  if (motivo) console.log(`💬 Motivo: ${motivo}`);
  console.log('');
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Atualização sobre sua Reserva - SiloShare",
      html: getReservaRejeitadaEmailTemplate(userName, siloNome, capacidade, dataInicio, dataFim, valorTotal, motivo),
    });
    
    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ E-mail enviado com sucesso!');
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Template de e-mail de nova reserva (para proprietário)
 */
function getNovaReservaEmailTemplate(
  proprietarioNome: string,
  siloNome: string,
  produtorNome: string,
  produtorEmail: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number
): string {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Reserva Recebida - SiloShare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #000000; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #4a4a4a; margin-bottom: 30px; }
    .notification-banner { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1); }
    .notification-icon { font-size: 48px; margin-bottom: 12px; }
    .notification-title { font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 8px; }
    .notification-subtitle { font-size: 14px; color: #1e3a8a; }
    .details-container { background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px; }
    .details-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 14px; color: #6b7280; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .highlight-value { color: #3b82f6; font-size: 18px; }
    .client-info { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .client-info-title { font-size: 14px; font-weight: 600; color: #166534; margin-bottom: 8px; }
    .client-info-text { font-size: 13px; color: #166534; line-height: 1.6; }
    .action-section { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    .action-section-title { font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .action-section-text { font-size: 13px; color: #92400e; line-height: 1.6; }
    .action-button { display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px; }
    .footer { padding: 30px 40px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer-text { font-size: 12px; color: #999; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">🌾 SiloShare</span>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Olá, ${proprietarioNome}!</div>
      <div class="notification-banner">
        <div class="notification-icon">🔔</div>
        <div class="notification-title">Nova Reserva Recebida!</div>
        <div class="notification-subtitle">Um cliente está interessado no seu silo</div>
      </div>
      <div class="message">Você recebeu uma nova solicitação de reserva no seu silo. Confira os detalhes abaixo e tome uma ação:</div>
      <div class="details-container">
        <div class="details-title">📋 Detalhes da Reserva</div>
        <div class="detail-row">
          <span class="detail-label">Silo</span>
          <span class="detail-value">${siloNome}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Capacidade Solicitada</span>
          <span class="detail-value">${capacidade.toLocaleString('pt-BR')} toneladas</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Período</span>
          <span class="detail-value">${formatDate(dataInicio)} até ${formatDate(dataFim)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor Total</span>
          <span class="detail-value highlight-value">${formatCurrency(valorTotal)}</span>
        </div>
      </div>
      <div class="client-info">
        <div class="client-info-title">👤 Informações do Cliente</div>
        <div class="client-info-text">
          <strong>Nome:</strong> ${produtorNome}<br>
          <strong>E-mail:</strong> ${produtorEmail}
        </div>
      </div>
      <div class="action-section">
        <div class="action-section-title">⚡ Ação Necessária</div>
        <div class="action-section-text">
          Esta reserva está aguardando sua aprovação. Acesse a plataforma para aprovar ou rejeitar a solicitação.<br>
          <strong>Importante:</strong> O cliente será notificado por e-mail da sua decisão.
        </div>
      </div>
      <div class="message" style="font-size: 13px; color: #999;">Acesse sua conta na SiloShare para gerenciar esta e outras reservas.</div>
    </div>
    <div class="footer">
      <div class="footer-text">© ${new Date().getFullYear()} SiloShare. Todos os direitos reservados.</div>
      <div class="footer-text">Conectando produtores rurais a silos de armazenagem em todo o Brasil.</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Enviar e-mail de nova reserva (para proprietário)
 */
export async function sendNovaReservaEmail(
  proprietarioEmail: string,
  proprietarioNome: string,
  siloNome: string,
  produtorNome: string,
  produtorEmail: string,
  capacidade: number,
  dataInicio: Date,
  dataFim: Date,
  valorTotal: number
) {
  // LOG PARA DESENVOLVIMENTO
  console.log(`\n🔔 E-MAIL: NOVA RESERVA\n`);
  console.log(`📧 Para: ${proprietarioEmail}`);
  console.log(`👤 Proprietário: ${proprietarioNome}`);
  console.log(`🏢 Silo: ${siloNome}`);
  console.log(`👥 Cliente: ${produtorNome} (${produtorEmail})`);
  console.log(`📦 Capacidade: ${capacidade} ton`);
  console.log(`💰 Valor: R$ ${valorTotal.toLocaleString('pt-BR')}\n`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [proprietarioEmail],
      subject: "🔔 Nova Reserva Recebida no seu Silo! - SiloShare",
      html: getNovaReservaEmailTemplate(
        proprietarioNome,
        siloNome,
        produtorNome,
        produtorEmail,
        capacidade,
        dataInicio,
        dataFim,
        valorTotal
      ),
    });
    
    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ E-mail enviado com sucesso!');
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
