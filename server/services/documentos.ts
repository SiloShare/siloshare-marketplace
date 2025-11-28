import { Router } from 'express';
import { db } from '../db';
import { documentosSilos } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Criar/salvar documento de silo
 */
router.post('/documentos-silos', async (req, res) => {
  try {
    const { siloId, tipo, nome, descricao, url, nomeArquivo, tamanho, obrigatorio } = req.body;
    
    if (!siloId || !tipo || !nome || !url) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    const result = await db.insert(documentosSilos).values({
      siloId: parseInt(siloId),
      tipo,
      nome,
      descricao,
      url,
      nomeArquivo,
      tamanho: tamanho ? parseInt(tamanho) : null,
      obrigatorio: obrigatorio || false,
    });
    
    console.log(`[Documentos] Documento salvo: ${nome} (silo: ${siloId})`);
    res.json({ success: true, id: result[0].insertId });
  } catch (error) {
    console.error('[Documentos] Erro ao salvar documento:', error);
    res.status(500).json({ error: 'Erro ao salvar documento' });
  }
});

/**
 * Listar documentos de um silo
 */
router.get('/documentos-silos/:siloId', async (req, res) => {
  try {
    const { siloId } = req.params;
    
    const docs = await db
      .select()
      .from(documentosSilos)
      .where(eq(documentosSilos.siloId, parseInt(siloId)))
      .orderBy(documentosSilos.createdAt);
    
    console.log(`[Documentos] ${docs.length} documentos encontrados (silo: ${siloId})`);
    res.json(docs);
  } catch (error) {
    console.error('[Documentos] Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

/**
 * Deletar documento
 */
router.delete('/documentos-silos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .delete(documentosSilos)
      .where(eq(documentosSilos.id, parseInt(id)));
    
    console.log(`[Documentos] Documento deletado: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Documentos] Erro ao deletar documento:', error);
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

/**
 * Marcar documento como verificado (admin)
 */
router.patch('/documentos-silos/:id/verificar', async (req, res) => {
  try {
    const { id } = req.params;
    const { verificado } = req.body;
    
    await db
      .update(documentosSilos)
      .set({ verificado: verificado || true })
      .where(eq(documentosSilos.id, parseInt(id)));
    
    console.log(`[Documentos] Documento verificado: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Documentos] Erro ao verificar documento:', error);
    res.status(500).json({ error: 'Erro ao verificar documento' });
  }
});

export default router;

