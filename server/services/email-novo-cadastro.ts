import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@siloshare.com.br';
const FROM_NAME = 'SiloShare';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@siloshare.com.br';

/**
 * Envia notificação para admin sobre novo cadastro de silo
 */
export async function enviarNotificacaoNovoCadastroAdmin(
  siloId: number,
  fornecedor: {
    nome: string;
    email: string;
  },
  silo: {
    tipo: string;
    localizacao: string;
    capacidade: number;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: '🆕 Novo cadastro de silo pendente de aprovação - SiloShare',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 40px;
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #000000;
              margin: 0;
              font-size: 32px;
            }
            .info-box {
              background-color: #f0f9ff;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              width: 150px;
              color: #6b7280;
            }
            .info-value {
              flex: 1;
              color: #111827;
            }
            .button {
              display: inline-block;
              background-color: #000000;
              color: #ffffff;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 14px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>🌾 SiloShare</h1>
            </div>
            
            <h2>Novo Cadastro Pendente de Aprovação</h2>
            
            <p>Um novo silo foi cadastrado na plataforma e está aguardando sua análise.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Informações do Silo</h3>
              <div class="info-row">
                <div class="info-label">ID:</div>
                <div class="info-value">#${siloId}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Tipo:</div>
                <div class="info-value">${silo.tipo}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Localização:</div>
                <div class="info-value">${silo.localizacao}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Capacidade:</div>
                <div class="info-value">${silo.capacidade.toLocaleString('pt-BR')} toneladas</div>
              </div>
            </div>
            
            <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
              <h3 style="margin-top: 0;">Fornecedor</h3>
              <div class="info-row">
                <div class="info-label">Nome:</div>
                <div class="info-value">${fornecedor.nome}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${fornecedor.email}</div>
              </div>
            </div>
            
            <p><strong>⏱️ Prazo de resposta:</strong> 48 horas</p>
            
            <div style="text-align: center;">
              <a href="https://siloshare.com.br/admin/aprovar-silos" class="button">Ver Cadastros Pendentes</a>
            </div>
            
            <div class="footer">
              <p>SiloShare - Marketplace de Armazenagem e Transporte de Grãos</p>
              <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Erro ao enviar notificação para admin:', error);
      throw new Error('Falha ao enviar e-mail');
    }

    console.log('[Email] Notificação enviada para admin:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Erro ao enviar e-mail:', error);
    throw error;
  }
}

/**
 * Envia confirmação para fornecedor que cadastro está em análise
 */
export async function enviarConfirmacaoCadastroEmAnalise(
  email: string,
  nome: string,
  silo: {
    tipo: string;
    localizacao: string;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: '⏱️ Seu cadastro está em análise - SiloShare',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 40px;
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #000000;
              margin: 0;
              font-size: 32px;
            }
            .status-box {
              background-color: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 30px 0;
            }
            .timeline {
              margin: 30px 0;
            }
            .timeline-item {
              display: flex;
              gap: 15px;
              margin-bottom: 20px;
            }
            .timeline-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #22c55e;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              flex-shrink: 0;
            }
            .timeline-icon.pending {
              background-color: #f59e0b;
            }
            .timeline-content h4 {
              margin: 0 0 5px 0;
            }
            .timeline-content p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #000000;
              color: #ffffff;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 14px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>🌾 SiloShare</h1>
            </div>
            
            <h2>Olá, ${nome}!</h2>
            
            <p>Recebemos seu cadastro do silo <strong>${silo.tipo}</strong> em ${silo.localizacao}.</p>
            
            <div class="status-box">
              <h3 style="margin-top: 0;">📋 Status: Em Análise</h3>
              <p>Nossa equipe está revisando suas informações e documentos.</p>
              <p><strong>Prazo de resposta: até 48 horas</strong></p>
            </div>
            
            <div class="timeline">
              <h3>Próximos Passos:</h3>
              
              <div class="timeline-item">
                <div class="timeline-icon">✓</div>
                <div class="timeline-content">
                  <h4>Cadastro Enviado</h4>
                  <p>Suas informações foram recebidas com sucesso</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon pending">⏱</div>
                <div class="timeline-content">
                  <h4>Análise da Equipe</h4>
                  <p>Estamos verificando seus documentos e informações (até 48h)</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon" style="background-color: #e5e7eb; color: #9ca3af;">3</div>
                <div class="timeline-content">
                  <h4>Aprovação</h4>
                  <p>Você receberá um e-mail com o resultado da análise</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon" style="background-color: #e5e7eb; color: #9ca3af;">4</div>
                <div class="timeline-content">
                  <h4>Silo Disponível</h4>
                  <p>Seu silo ficará visível para produtores em toda a plataforma</p>
                </div>
              </div>
            </div>
            
            <p><strong>O que estamos verificando:</strong></p>
            <ul>
              <li>Documentação completa e válida</li>
              <li>Informações de capacidade e infraestrutura</li>
              <li>Fotos e descrição do silo</li>
              <li>Conformidade com requisitos legais</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://siloshare.com.br/painel-fornecedor" class="button">Acompanhar Status</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>Dúvidas?</strong> Entre em contato conosco através do suporte.
            </p>
            
            <div class="footer">
              <p>SiloShare - Marketplace de Armazenagem e Transporte de Grãos</p>
              <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Erro ao enviar confirmação:', error);
      throw new Error('Falha ao enviar e-mail');
    }

    console.log('[Email] Confirmação enviada:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Erro ao enviar e-mail:', error);
    throw error;
  }
}

