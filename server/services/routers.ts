import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as emailService from "./email";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    enviarCodigoVerificacao: protectedProcedure
      .input(z.object({ tipo: z.enum(["email", "celular"]) }))
      .mutation(async ({ input, ctx }) => {
        return await db.enviarCodigoVerificacao(ctx.user!.id, input.tipo);
      }),

    verificarCodigo: protectedProcedure
      .input(z.object({ 
        tipo: z.enum(["email", "celular"]),
        codigo: z.string().length(6)
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.verificarCodigo(ctx.user!.id, input.tipo, input.codigo);
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE SILOS
   * ========================================
   */
  silos: router({
    listar: publicProcedure
      .query(async () => {
        return await db.getSilos();
      }),

    list: publicProcedure
      .input(
        z.object({
          cidade: z.string().optional(),
          estado: z.string().optional(),
          disponivel: z.boolean().optional(),
          precoMin: z.number().optional(),
          precoMax: z.number().optional(),
          capacidadeMin: z.number().optional(),
          tipoGrao: z.string().optional(),
          infraSecagem: z.boolean().optional(),
          infraLimpeza: z.boolean().optional(),
          infraAeracao: z.boolean().optional(),
          infraMonitoramento: z.boolean().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await db.getSilos(input);
      }),

    count: publicProcedure
      .input(
        z.object({
          cidade: z.string().optional(),
          estado: z.string().optional(),
          disponivel: z.boolean().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await db.countSilos(input);
      }),

    proximos: publicProcedure
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          raioKm: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.getSilosProximos(input.lat, input.lng, input.raioKm);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSiloById(input.id);
      }),

    myList: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getSilosByUserId(ctx.user.id);
      }),

    listarParaAprovacao: protectedProcedure
      .query(async ({ ctx }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem acessar esta função.");
        }
        return await db.getSilosParaAprovacao();
      }),

    aprovar: protectedProcedure
      .input(z.object({ siloId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem aprovar silos.");
        }
        return await db.aprovarSilo(input.siloId, ctx.user.id);
      }),

    reprovar: protectedProcedure
      .input(z.object({ 
        siloId: z.number(),
        motivo: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem reprovar silos.");
        }
        return await db.reprovarSilo(input.siloId, input.motivo, ctx.user.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string(),
          descricao: z.string().optional(),
          cidade: z.string(),
          estado: z.string(),
          endereco: z.string().optional(),
          lat: z.string(),
          lng: z.string(),
          capacidadeTotal: z.number(),
          capacidadeDisponivel: z.number(),
          precoTonelada: z.string(),
          tiposGraos: z.string(),
          infraSecagem: z.boolean().optional(),
          infraLimpeza: z.boolean().optional(),
          infraAeracao: z.boolean().optional(),
          infraMonitoramento: z.boolean().optional(),
          imagemUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createSilo({
          ...input,
          userId: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nome: z.string().optional(),
          descricao: z.string().optional(),
          capacidadeDisponivel: z.number().optional(),
          precoTonelada: z.string().optional(),
          disponivel: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateSilo(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSilo(input.id);
        return { success: true };
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE RESERVAS
   * ========================================
   */
  reservas: router({
    list: protectedProcedure
      .input(
        z.object({
          produtorId: z.string().optional(),
          siloId: z.number().optional(),
          status: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await db.getReservas(input);
      }),

    myList: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getReservas({ produtorId: ctx.user.id });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getReservaById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          siloId: z.number(),
          siloNome: z.string(),
          tipoGrao: z.string(),
          quantidade: z.number(),
          dataInicio: z.date(),
          dataFim: z.date(),
          valorTotal: z.string(),
          necessitaTransporte: z.boolean().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createReserva({
          ...input,
          produtorId: ctx.user.id,
          produtorNome: ctx.user.name || "Produtor",
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "confirmada", "em_andamento", "concluida", "cancelada"]).optional(),
          cotacaoSelecionadaId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateReserva(id, updates);
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE COTAÇÕES DE TRANSPORTE
   * ========================================
   */
  cotacoes: router({
    listByReserva: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCotacoesByReservaId(input.reservaId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          reservaId: z.number(),
          valorFrete: z.string(),
          prazoEntrega: z.number(),
          tipoVeiculo: z.string(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createCotacaoTransporte({
          ...input,
          transportadoraId: ctx.user.id,
          transportadoraNome: ctx.user.name || "Transportadora",
        });
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE AUTO-SAVE
   * ========================================
   */
  autoSave: router({
    save: protectedProcedure
      .input(
        z.object({
          key: z.string(),
          data: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.saveAutoSave(ctx.user.id, input.key, input.data);
      }),

    load: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        return await db.loadAutoSave(ctx.user.id, input.key);
      }),

    delete: protectedProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAutoSave(ctx.user.id, input.key);
        return { success: true };
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE DOCUMENTOS
   * ========================================
   */
  documentos: router({
    listBySilo: publicProcedure
      .input(z.object({ siloId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentosBySiloId(input.siloId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          siloId: z.number(),
          tipo: z.string(),
          nome: z.string(),
          descricao: z.string().optional(),
          url: z.string(),
          nomeArquivo: z.string().optional(),
          tamanho: z.number().optional(),
          obrigatorio: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createDocumentoSilo(input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDocumentoSilo(input.id);
        return { success: true };
      }),

    verificar: protectedProcedure
      .input(z.object({ id: z.number(), verificado: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem verificar documentos.");
        }
        await db.verificarDocumento(input.id, input.verificado);
        return { success: true };
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE CONTRATAÇÃO
   * ========================================
   */
  contratacao: router({
    buscarSilos: publicProcedure
      .input(
        z.object({
          cidade: z.string(),
          estado: z.string(),
          raio: z.number(),
          tipoGrao: z.string(),
          quantidade: z.number(),
        })
      )
      .query(async ({ input }) => {
        // Buscar silos disponíveis na região
        const silos = await db.getSilos({
          cidade: input.cidade,
          estado: input.estado,
          disponivel: true,
          tipoGrao: input.tipoGrao,
          capacidadeMin: input.quantidade,
        });
        return { silos };
      }),

    finalizar: protectedProcedure
      .input(
        z.object({
          siloId: z.number(),
          tipoGrao: z.string(),
          quantidade: z.number(),
          dataInicio: z.string(),
          dataFim: z.string(),
          necessitaTransporte: z.boolean(),
          metodoPagamento: z.enum(["pix", "boleto", "cartao"]),
          contratoAceito: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Criar reserva
        const silo = await db.getSiloById(input.siloId);
        if (!silo) {
          throw new Error("Silo não encontrado");
        }

        const valorTotal = input.quantidade * parseFloat(silo.precoTonelada);

        const reserva = await db.createReserva({
          siloId: input.siloId,
          siloNome: silo.nome,
          produtorId: ctx.user.id,
          produtorNome: ctx.user.name || "",
          tipoGrao: input.tipoGrao,
          quantidade: input.quantidade,
          dataInicio: new Date(input.dataInicio),
          dataFim: new Date(input.dataFim),
          valorTotal: valorTotal.toString(),
          status: "pendente",
          necessitaTransporte: input.necessitaTransporte,
        });

        return { success: true, reservaId: reserva.id };
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE ADMIN
   * ========================================
   */
  admin: router({
    estatisticas: protectedProcedure
      .query(async ({ ctx }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem acessar estatísticas.");
        }
        return await db.getEstatisticasAdmin();
      }),

    notificarNovoCadastro: protectedProcedure
      .input(z.object({ siloId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.notificarNovoCadastro(input.siloId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
