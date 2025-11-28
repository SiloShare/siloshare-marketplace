import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { contratos, reservas, silos, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const client = createClient({
  url: process.env.DATABASE_URL || "file:./siloshare.db",
});

const db = drizzle(client);

/**
 * Gerar contrato para uma reserva
 */
export async function gerarContrato(reservaId: number) {
  try {
    // Verificar se já existe contrato
    const [existingContrato] = await db
      .select()
      .from(contratos)
      .where(eq(contratos.reservaId, reservaId));

    if (existingContrato) {
      return existingContrato;
    }

    // Buscar informações completas da reserva
    const [reservaData] = await db
      .select({
        reservaId: reservas.id,
        capacidade: reservas.capacidade,
        dataInicio: reservas.dataInicio,
        dataFim: reservas.dataFim,
        valorTotal: reservas.valorTotal,
        produtorId: reservas.produtorId,
        siloId: reservas.siloId,
        siloNome: silos.nome,
        siloEndereco: silos.endereco,
        siloCidade: silos.cidade,
        siloEstado: silos.estado,
        proprietarioId: silos.userId,
        produtorNome: users.name,
        produtorEmail: users.email,
        produtorCpfCnpj: users.cpfCnpj,
      })
      .from(reservas)
      .leftJoin(silos, eq(reservas.siloId, silos.id))
      .leftJoin(users, eq(reservas.produtorId, users.id))
      .where(eq(reservas.id, reservaId));

    if (!reservaData) {
      throw new Error('Reserva não encontrada');
    }

    // Buscar informações do proprietário
    const [proprietario] = await db
      .select({
        nome: users.name,
        email: users.email,
        cpfCnpj: users.cpfCnpj,
      })
      .from(users)
      .where(eq(users.id, reservaData.proprietarioId));

    // Gerar conteúdo HTML do contrato
    const conteudoHtml = gerarConteudoContrato({
      ...reservaData,
      proprietarioNome: proprietario.nome,
      proprietarioEmail: proprietario.email,
      proprietarioCpfCnpj: proprietario.cpfCnpj,
    });

    // Criar contrato
    const [contrato] = await db
      .insert(contratos)
      .values({
        reservaId,
        proprietarioId: reservaData.proprietarioId,
        produtorId: reservaData.produtorId,
        conteudo: conteudoHtml,
        status: 'pending',
      })
      .returning();

    console.log(`✅ Contrato ${contrato.id} gerado para reserva ${reservaId}`);

    return contrato;
  } catch (error) {
    console.error('❌ Erro ao gerar contrato:', error);
    throw error;
  }
}

/**
 * Gerar conteúdo HTML do contrato
 */
function gerarConteudoContrato(data: any): string {
  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const dataInicio = format(new Date(data.dataInicio), "dd/MM/yyyy");
  const dataFim = format(new Date(data.dataFim), "dd/MM/yyyy");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      text-align: center;
      color: #000;
      margin-bottom: 30px;
      font-size: 24px;
    }
    h2 {
      color: #000;
      font-size: 18px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    .info-box {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-box strong {
      display: block;
      margin-bottom: 5px;
    }
    .signature-box {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #000;
    }
    .signature-line {
      margin-top: 60px;
      padding-top: 10px;
      border-top: 1px solid #000;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>CONTRATO DE ARMAZENAGEM DE GRÃOS</h1>
  
  <p>Pelo presente instrumento particular, as partes abaixo qualificadas:</p>
  
  <div class="info-box">
    <strong>CONTRATANTE (Produtor):</strong>
    Nome: ${data.produtorNome || 'Não informado'}<br>
    CPF/CNPJ: ${data.produtorCpfCnpj || 'Não informado'}<br>
    E-mail: ${data.produtorEmail || 'Não informado'}
  </div>
  
  <div class="info-box">
    <strong>CONTRATADO (Proprietário do Silo):</strong>
    Nome: ${data.proprietarioNome || 'Não informado'}<br>
    CPF/CNPJ: ${data.proprietarioCpfCnpj || 'Não informado'}<br>
    E-mail: ${data.proprietarioEmail || 'Não informado'}
  </div>
  
  <p>Têm entre si justo e contratado o presente CONTRATO DE ARMAZENAGEM DE GRÃOS, que se regerá pelas cláusulas e condições seguintes:</p>
  
  <h2>CLÁUSULA PRIMEIRA - DO OBJETO</h2>
  <p>O presente contrato tem por objeto a armazenagem de grãos no silo identificado como:</p>
  
  <div class="info-box">
    <strong>IDENTIFICAÇÃO DO SILO:</strong>
    Nome: ${data.siloNome}<br>
    Endereço: ${data.siloEndereco}<br>
    Cidade: ${data.siloCidade} - ${data.siloEstado}
  </div>
  
  <h2>CLÁUSULA SEGUNDA - DA CAPACIDADE E PERÍODO</h2>
  <p>O CONTRATADO disponibilizará ao CONTRATANTE a capacidade de armazenagem de <strong>${data.capacidade.toLocaleString('pt-BR')} toneladas</strong>, pelo período compreendido entre <strong>${dataInicio}</strong> e <strong>${dataFim}</strong>.</p>
  
  <h2>CLÁUSULA TERCEIRA - DO VALOR</h2>
  <p>O valor total do presente contrato é de <strong>R$ ${data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>, a ser pago conforme condições estabelecidas na plataforma SiloShare.</p>
  
  <h2>CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CONTRATADO</h2>
  <p>São obrigações do CONTRATADO:</p>
  <p>a) Manter o silo em perfeitas condições de armazenagem;</p>
  <p>b) Garantir a segurança e conservação dos grãos armazenados;</p>
  <p>c) Permitir ao CONTRATANTE o acesso aos grãos armazenados mediante aviso prévio;</p>
  <p>d) Comunicar imediatamente ao CONTRATANTE qualquer ocorrência que possa afetar a qualidade dos grãos.</p>
  
  <h2>CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO CONTRATANTE</h2>
  <p>São obrigações do CONTRATANTE:</p>
  <p>a) Efetuar o pagamento conforme estabelecido;</p>
  <p>b) Entregar os grãos em condições adequadas de armazenagem;</p>
  <p>c) Retirar os grãos ao término do período contratado;</p>
  <p>d) Comunicar previamente a retirada dos grãos.</p>
  
  <h2>CLÁUSULA SEXTA - DA RESCISÃO</h2>
  <p>O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia de 30 (trinta) dias, sem prejuízo das obrigações já assumidas.</p>
  
  <h2>CLÁUSULA SÉTIMA - DO FORO</h2>
  <p>As partes elegem o foro da comarca de ${data.siloCidade} - ${data.siloEstado} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato.</p>
  
  <p style="margin-top: 40px;">E, por estarem assim justos e contratados, as partes assinam eletronicamente o presente instrumento.</p>
  
  <p style="text-align: center; margin-top: 30px;">${dataAtual}</p>
  
  <div class="signature-box">
    <div class="signature-line">
      ${data.produtorNome || 'Produtor'}<br>
      CONTRATANTE
    </div>
    
    <div class="signature-line">
      ${data.proprietarioNome || 'Proprietário'}<br>
      CONTRATADO
    </div>
  </div>
  
  <p style="text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
    Contrato gerado eletronicamente pela plataforma SiloShare<br>
    ID do Contrato: #${data.reservaId}
  </p>
</body>
</html>
  `.trim();
}

/**
 * Assinar contrato
 */
export async function assinarContrato(contratoId: number, userId: string, ipAddress: string) {
  try {
    const [contrato] = await db
      .select()
      .from(contratos)
      .where(eq(contratos.id, contratoId));

    if (!contrato) {
      throw new Error('Contrato não encontrado');
    }

    const timestamp = new Date().toISOString();
    const assinatura = JSON.stringify({ ip: ipAddress, timestamp });

    let novoStatus = contrato.status;
    const updates: any = {};

    // Verificar quem está assinando
    if (userId === contrato.produtorId) {
      updates.assinaturaProdutor = assinatura;
      novoStatus = contrato.assinaturaProprietario ? 'completed' : 'signed_by_producer';
    } else if (userId === contrato.proprietarioId) {
      updates.assinaturaProprietario = assinatura;
      novoStatus = contrato.assinaturaProdutor ? 'completed' : 'signed_by_owner';
    } else {
      throw new Error('Você não tem permissão para assinar este contrato');
    }

    updates.status = novoStatus;
    if (novoStatus === 'completed') {
      updates.signedAt = new Date();
    }

    // Atualizar contrato
    await db
      .update(contratos)
      .set(updates)
      .where(eq(contratos.id, contratoId));

    console.log(`✅ Contrato ${contratoId} assinado por ${userId}. Status: ${novoStatus}`);

    return { success: true, status: novoStatus };
  } catch (error) {
    console.error('❌ Erro ao assinar contrato:', error);
    throw error;
  }
}

/**
 * Buscar contrato de uma reserva
 */
export async function getContratoByReserva(reservaId: number) {
  try {
    const [contrato] = await db
      .select()
      .from(contratos)
      .where(eq(contratos.reservaId, reservaId));

    return contrato;
  } catch (error) {
    console.error('❌ Erro ao buscar contrato:', error);
    throw error;
  }
}

/**
 * Buscar contratos do usuário
 */
export async function getContratosByUser(userId: string) {
  try {
    const userContratos = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.produtorId, userId)
        )
      );

    const ownerContratos = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.proprietarioId, userId)
        )
      );

    return [...userContratos, ...ownerContratos];
  } catch (error) {
    console.error('❌ Erro ao buscar contratos do usuário:', error);
    throw error;
  }
}
