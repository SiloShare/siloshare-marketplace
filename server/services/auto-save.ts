import { Router } from 'express';
import { db } from '../db';
import { cadastrosRascunho } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

/**
 * Salvar rascunho de cadastro (auto-save)
 */
router.post('/auto-save', async (req, res) => {
  try {
    const { userId, key, data } = req.body;
    
    if (!userId || !key || !data) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Verificar se já existe um rascunho
    const existing = await db
      .select()
      .from(cadastrosRascunho)
      .where(and(
        eq(cadastrosRascunho.userId, userId),
        eq(cadastrosRascunho.key, key)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Atualizar rascunho existente
      await db
        .update(cadastrosRascunho)
        .set({ 
          data: JSON.stringify(data), 
          updatedAt: new Date() 
        })
        .where(eq(cadastrosRascunho.id, existing[0].id));
      
      console.log(`[Auto-Save] Rascunho atualizado: ${key} (user: ${userId})`);
    } else {
      // Criar novo rascunho
      await db.insert(cadastrosRascunho).values({
        userId,
        key,
        data: JSON.stringify(data),
      });
      
      console.log(`[Auto-Save] Novo rascunho criado: ${key} (user: ${userId})`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Auto-Save] Erro ao salvar rascunho:', error);
    res.status(500).json({ error: 'Erro ao salvar rascunho' });
  }
});

/**
 * Carregar rascunho de cadastro
 */
router.get('/auto-save/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    const result = await db
      .select()
      .from(cadastrosRascunho)
      .where(and(
        eq(cadastrosRascunho.userId, userId),
        eq(cadastrosRascunho.key, key)
      ))
      .limit(1);
    
    if (result.length > 0) {
      console.log(`[Auto-Save] Rascunho carregado: ${key} (user: ${userId})`);
      res.json({ data: JSON.parse(result[0].data) });
    } else {
      console.log(`[Auto-Save] Nenhum rascunho encontrado: ${key} (user: ${userId})`);
      res.json({ data: null });
    }
  } catch (error) {
    console.error('[Auto-Save] Erro ao carregar rascunho:', error);
    res.status(500).json({ error: 'Erro ao carregar rascunho' });
  }
});

/**
 * Deletar rascunho (após conclusão do cadastro)
 */
router.delete('/auto-save/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    await db
      .delete(cadastrosRascunho)
      .where(and(
        eq(cadastrosRascunho.userId, userId),
        eq(cadastrosRascunho.key, key)
      ));
    
    console.log(`[Auto-Save] Rascunho deletado: ${key} (user: ${userId})`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Auto-Save] Erro ao deletar rascunho:', error);
    res.status(500).json({ error: 'Erro ao deletar rascunho' });
  }
});

export default router;

