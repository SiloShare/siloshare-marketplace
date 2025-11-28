import { Router } from 'express';
import { db } from '../db';
import { silos, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { enviarNotificacaoNovoCadastroAdmin, enviarConfirmacaoCadastroEmAnalise } from '../email-novo-cadastro';
import { enviarNotificacaoSiloAprovado, enviarNotificacaoSiloReprovado } from '../email';

const router = Router();

/**
 * Listar silos pendentes de aprovação
 */
router.get('/admin/silos-pendentes', async (req, res) => {
  try {
    const pendentes = await db
      .select()
      .from(silos)
      .where(eq(silos.statusAprovacao, 'pendente'))
      .orderBy(silos.createdAt, 'desc');
    
    console.log(`[Admin] ${pendentes.length} silos pendentes encontrados`);
    res.json(pendentes);
  } catch (error) {
    console.error('[Admin] Erro ao buscar silos pendentes:', error);
    res.status(500).json({ error: 'Erro ao buscar silos' });
  }
});

/**
 * Aprovar silo
 */
router.post('/admin/silos/:id/aprovar', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    
    // Atualizar status do silo
    await db
      .update(silos)
      .set({
        statusAprovacao: 'aprovado',
        aprovadoPor: adminId || 'admin',
        aprovadoEm: new Date(),
        disponivel: true,
        ativo: true,
      })
      .where(eq(silos.id, parseInt(id)));
    
    // Buscar dados do silo
    const siloData = await db
      .select()
      .from(silos)
      .where(eq(silos.id, parseInt(id)))
      .limit(1);
    
    if (siloData.length === 0) {
      return res.status(404).json({ error: 'Silo não encontrado' });
    }
    
    // Buscar dados do fornecedor
    const fornecedor = await db
      .select()
      .from(users)
      .where(eq(users.id, siloData[0].userId))
      .limit(1);
    
    if (fornecedor.length > 0 && fornecedor[0].email) {
      // Enviar email de aprovação
      try {
        await enviarNotificacaoSiloAprovado(
          fornecedor[0].email,
          siloData[0].nome,
          fornecedor[0].name || undefined
        );
        console.log(`[Admin] Email de aprovação enviado para ${fornecedor[0].email}`);
      } catch (emailError) {
        console.error('[Admin] Erro ao enviar email de aprovação:', emailError);
        // Não falhar a aprovação se o email falhar
      }
    }
    
    console.log(`[Admin] Silo aprovado: ${id} (${siloData[0].nome})`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Erro ao aprovar silo:', error);
    res.status(500).json({ error: 'Erro ao aprovar silo' });
  }
});

/**
 * Rejeitar silo
 */
router.post('/admin/silos/:id/rejeitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'Motivo da reprovação é obrigatório' });
    }
    
    // Atualizar status do silo
    await db
      .update(silos)
      .set({
        statusAprovacao: 'reprovado',
        motivoReprovacao: motivo,
        disponivel: false,
      })
      .where(eq(silos.id, parseInt(id)));
    
    // Buscar dados do silo
    const siloData = await db
      .select()
      .from(silos)
      .where(eq(silos.id, parseInt(id)))
      .limit(1);
    
    if (siloData.length === 0) {
      return res.status(404).json({ error: 'Silo não encontrado' });
    }
    
    // Buscar dados do fornecedor
    const fornecedor = await db
      .select()
      .from(users)
      .where(eq(users.id, siloData[0].userId))
      .limit(1);
    
    if (fornecedor.length > 0 && fornecedor[0].email) {
      // Enviar email de reprovação
      try {
        await enviarNotificacaoSiloReprovado(
          fornecedor[0].email,
          siloData[0].nome,
          motivo,
          fornecedor[0].name || undefined
        );
        console.log(`[Admin] Email de reprovação enviado para ${fornecedor[0].email}`);
      } catch (emailError) {
        console.error('[Admin] Erro ao enviar email de reprovação:', emailError);
        // Não falhar a reprovação se o email falhar
      }
    }
    
    console.log(`[Admin] Silo reprovado: ${id} (${siloData[0].nome})`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Erro ao rejeitar silo:', error);
    res.status(500).json({ error: 'Erro ao rejeitar silo' });
  }
});

/**
 * Notificar admin sobre novo cadastro
 */
router.post('/admin/notificar-novo-cadastro', async (req, res) => {
  try {
    const { siloId } = req.body;
    
    if (!siloId) {
      return res.status(400).json({ error: 'siloId é obrigatório' });
    }
    
    // Buscar dados do silo
    const siloData = await db
      .select()
      .from(silos)
      .where(eq(silos.id, parseInt(siloId)))
      .limit(1);
    
    if (siloData.length === 0) {
      return res.status(404).json({ error: 'Silo não encontrado' });
    }
    
    // Buscar dados do fornecedor
    const fornecedor = await db
      .select()
      .from(users)
      .where(eq(users.id, siloData[0].userId))
      .limit(1);
    
    if (fornecedor.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    
    // Enviar email para admin
    try {
      await enviarNotificacaoNovoCadastroAdmin(
        siloData[0].id,
        {
          nome: fornecedor[0].name || 'Fornecedor',
          email: fornecedor[0].email || 'email@exemplo.com',
        },
        {
          tipo: siloData[0].nome,
          localizacao: `${siloData[0].cidade}, ${siloData[0].estado}`,
          capacidade: siloData[0].capacidadeTotal,
        }
      );
      console.log(`[Admin] Email de novo cadastro enviado para admin`);
    } catch (emailError) {
      console.error('[Admin] Erro ao enviar email para admin:', emailError);
    }
    
    // Enviar email para fornecedor
    if (fornecedor[0].email) {
      try {
        await enviarConfirmacaoCadastroEmAnalise(
          fornecedor[0].email,
          fornecedor[0].name || 'Fornecedor',
          {
            tipo: siloData[0].nome,
            localizacao: `${siloData[0].cidade}, ${siloData[0].estado}`,
          }
        );
        console.log(`[Admin] Email de confirmação enviado para ${fornecedor[0].email}`);
      } catch (emailError) {
        console.error('[Admin] Erro ao enviar email para fornecedor:', emailError);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Erro ao notificar:', error);
    res.status(500).json({ error: 'Erro ao enviar notificações' });
  }
});

/**
 * Obter estatísticas do admin
 */
router.get('/admin/estatisticas', async (req, res) => {
  try {
    const pendentes = await db
      .select()
      .from(silos)
      .where(eq(silos.statusAprovacao, 'pendente'));
    
    const aprovados = await db
      .select()
      .from(silos)
      .where(eq(silos.statusAprovacao, 'aprovado'));
    
    const reprovados = await db
      .select()
      .from(silos)
      .where(eq(silos.statusAprovacao, 'reprovado'));
    
    res.json({
      pendentes: pendentes.length,
      aprovados: aprovados.length,
      reprovados: reprovados.length,
      total: pendentes.length + aprovados.length + reprovados.length,
    });
  } catch (error) {
    console.error('[Admin] Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;

