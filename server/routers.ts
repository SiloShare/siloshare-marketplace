

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { createReserva } from "./db-reservas";
import * as emailService from "./services/emailService";
import * as s3Service from "./services/s3Upload";
import * as historicoService from "./services/reservaHistoricoService";
import { getDashboardStatsV2 } from "./routers_dashboard_v2";
import { updateProfile, changePassword } from "./routers_profile";
import { createAvaliacao, getAvaliacoesBySilo, canUserReview } from "./routers_avaliacoes";
import { getOrCreateConversation, getUserConversations, getConversationMessages, sendMessage, markMessagesAsRead, getUnreadCount } from "./routers_messages";
import { createCheckoutSession, getPagamentosByReserva, getPagamentosByUser } from "./services/stripeService";
import { gerarContrato, assinarContrato, getContratoByReserva, getContratosByUser } from "./services/contratoService";
import { generateReservasReport, generateSilosReport } from "./services/reportService";
import { inArray, eq, sql, and, gte, lte } from 'drizzle-orm';
import { silos, reservas, users } from '../drizzle/schema';

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({ 
        email: z.string().email(), 
        senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
        cpfCnpj: z.string().optional(),
        telefone: z.string().optional(),
        recaptchaToken: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar reCAPTCHA
        if (input.recaptchaToken) {
          const { verifyRecaptcha } = await import("./services/recaptchaService");
          const recaptchaResult = await verifyRecaptcha(input.recaptchaToken, "register");
          if (!recaptchaResult.success) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Verificação de segurança falhou. Tente novamente.",
            });
          }
        }
        const { email, senha, name, cpfCnpj, telefone } = input;
        
        // Verificar se usuário já existe
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          throw new TRPCError({ 
            code: "CONFLICT", 
            message: "Este e-mail já está cadastrado" 
          });
        }
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);
        
        // Criar novo usuário
        const userId = Math.random().toString(36).substring(2, 15);
        await db.upsertUser({
          id: userId,
          email: email,
          password: hashedPassword,
          name: name,
          cpfCnpj: cpfCnpj || null,
          telefone: telefone || null,
          role: "user",
          tipoUsuario: "produtor",
          emailVerificado: false,
          verificado: false,
          lastSignedIn: new Date(),
        });
        
        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "Erro ao criar usuário" 
          });
        }
        
        // Gerar código de verificação
        const verificationCode = emailService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        
        // Salvar código no banco
        await db.saveVerificationCode(userId, verificationCode, expiresAt);
        
        // Enviar e-mail de verificação
        const emailResult = await emailService.sendVerificationEmail(
          email,
          name,
          verificationCode
        );
        
        if (!emailResult.success) {
          console.error("Erro ao enviar e-mail de verificação:", emailResult.error);
        }
        
        // Criar sessão (cookie) mesmo sem verificação
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.id, { 
          name: user.name || user.email || "" 
        });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return {
          success: true,
          user: user,
          emailSent: emailResult.success,
        };
      }),
        
    // Login
    login: publicProcedure
      .input(z.object({ 
        email: z.string().email(),
        senha: z.string().min(6),
        recaptchaToken: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar reCAPTCHA
        if (input.recaptchaToken) {
          const { verifyRecaptcha } = await import("./services/recaptchaService");
          const recaptchaResult = await verifyRecaptcha(input.recaptchaToken, "login");
          if (!recaptchaResult.success) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Verificação de segurança falhou. Tente novamente.",
            });
          }
        }
        const { email, senha } = input;
        
        // Buscar usuário no banco
        const user = await db.getUserByEmail(email);
        
        if (!user) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Email ou senha inválidos" 
          });
        }
        
        // Validar senha
        if (!user.password) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Usuário sem senha cadastrada. Use recuperação de senha." 
          });
        }
        
        const isPasswordValid = await bcrypt.compare(senha, user.password);
        if (!isPasswordValid) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Email ou senha inválidos" 
          });
        }
        
        // Atualizar último login
        await db.upsertUser({
          id: user.id,
          lastSignedIn: new Date(),
        });
        
        // Criar sessão (cookie)
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.id, { 
          name: user.name || user.email || "" 
        });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        console.log("[Login] Criando cookie de sessão:", {
          cookieName: COOKIE_NAME,
          tokenLength: sessionToken.length,
          options: cookieOptions,
        });
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return {
          success: true,
          user: user,
        };
      }),
    
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
    
    // Solicitar recuperação de senha
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { email } = input;
        
        // Buscar usuário
        const user = await db.getUserByEmail(email);
        if (!user) {
          // Não revelar se o e-mail existe ou não (segurança)
          return { success: true, message: "Se o e-mail existir, você receberá um código de recuperação" };
        }
        
        // Gerar código de recuperação
        const code = emailService.generateVerificationCode();
        
        // Salvar código no banco
        await db.saveVerificationCode(user.id, "email", code);
        
        // Enviar e-mail
        const emailResult = await emailService.sendPasswordResetEmail(
          email,
          user.name || "Usuário",
          code
        );
        
        return { 
          success: true, 
          message: "Se o e-mail existir, você receberá um código de recuperação",
          emailSent: emailResult.success
        };
      }),
    
    // Redefinir senha com código
    resetPassword: publicProcedure
      .input(z.object({ 
        email: z.string().email(),
        codigo: z.string().length(6),
        novaSenha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
      }))
      .mutation(async ({ input }) => {
        const { email, codigo, novaSenha } = input;
        
        // Buscar usuário
        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Código inválido ou expirado" 
          });
        }
        
        // Verificar código
        const isValid = await db.verifyCode(user.id, "email", codigo);
        if (!isValid.success) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: isValid.message || "Código inválido ou expirado" 
          });
        }
        
        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);
        
        // Atualizar senha no banco
        await db.upsertUser({
          id: user.id,
          password: hashedPassword,
        });
        
        return { 
          success: true, 
          message: "Senha redefinida com sucesso!" 
        };
      }),
  }),

  /**
   * ========================================
   * ROUTERS DE UPLOAD S3
   * ========================================
   */
  upload: router({
    // Gerar URL de upload para uma foto
    generatePhotoUploadUrl: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await s3Service.generateUploadUrl({
          ...input,
          folder: "silos",
        });
      }),

    // Gerar URL de upload para um documento
    generateDocumentUploadUrl: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await s3Service.generateUploadUrl({
          ...input,
          folder: "documents",
        });
      }),

    // Gerar múltiplas URLs de upload (para upload em lote)
    generateMultipleUploadUrls: protectedProcedure
      .input(
        z.array(
          z.object({
            fileName: z.string(),
            fileType: z.string(),
            fileSize: z.number(),
            folder: z.enum(["silos", "documents", "users"]),
          })
        )
      )
      .mutation(async ({ input }) => {
        return await s_3Service.generateMultipleUploadUrls(input);
      }),

    // Deletar arquivo do S3
    deleteFile: protectedProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        await s3Service.deleteFile(input.key);
        return { success: true };
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
          preco: z.number(),
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
          preco: z.number().optional(),
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

  reservas: router({
    create: protectedProcedure
      .input(
        z.object({
          siloId: z.number(),
          capacidadeReservada: z.number(),
          dataInicio: z.date(),
          dataFim: z.date(),
          valorTotal: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createReserva({
          ...input,
          produtorId: ctx.user.id,
        });
      }),

    // Listar reservas do cliente com nome do silo
    myReservations: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        busca: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const filters = input || {};
        
        // Construir condições de filtro
        const conditions = [eq(reservas.produtorId, ctx.user.id)];
        
        if (filters.status) {
          conditions.push(eq(reservas.status, filters.status));
        }
        
        if (filters.dataInicio) {
          conditions.push(gte(reservas.dataInicio, new Date(filters.dataInicio)));
        }
        
        if (filters.dataFim) {
          conditions.push(lte(reservas.dataFim, new Date(filters.dataFim)));
        }
        
        let results = await ctx.db
          .select({
            id: reservas.id,
            siloId: reservas.siloId,
            siloNome: silos.nome,
            produtorId: reservas.produtorId,
            capacidadeReservada: reservas.capacidadeReservada,
            dataInicio: reservas.dataInicio,
            dataFim: reservas.dataFim,
            valorTotal: reservas.valorTotal,
            status: reservas.status,
            pagamentoStatus: reservas.pagamentoStatus,
            contratoUrl: reservas.contratoUrl,
            createdAt: reservas.createdAt,
          })
          .from(reservas)
          .leftJoin(silos, eq(reservas.siloId, silos.id))
          .where(and(...conditions));
        
        // Filtro de busca por texto (nome do silo)
        if (filters.busca) {
          const searchTerm = filters.busca.toLowerCase();
          results = results.filter(r => 
            r.siloNome?.toLowerCase().includes(searchTerm)
          );
        }
        
        return results;
      }),

    // Listar reservas recebidas pelo proprietário com nomes de silo e produtor
    receivedReservations: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        siloId: z.number().optional(),
        busca: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const filters = input || {};
        
        const userSilos = await ctx.db.select({ id: silos.id }).from(silos).where(eq(silos.userId, ctx.user.id));
        const siloIds = userSilos.map(s => s.id);
        if (siloIds.length === 0) return [];
        
        // Construir condições de filtro
        const conditions = [inArray(reservas.siloId, siloIds)];
        
        if (filters.status) {
          conditions.push(eq(reservas.status, filters.status));
        }
        
        if (filters.siloId) {
          conditions.push(eq(reservas.siloId, filters.siloId));
        }
        
        if (filters.dataInicio) {
          conditions.push(gte(reservas.dataInicio, new Date(filters.dataInicio)));
        }
        
        if (filters.dataFim) {
          conditions.push(lte(reservas.dataFim, new Date(filters.dataFim)));
        }
        
        let results = await ctx.db
          .select({
            id: reservas.id,
            siloId: reservas.siloId,
            siloNome: silos.nome,
            produtorId: reservas.produtorId,
            produtorNome: users.name,
            produtorEmail: users.email,
            capacidadeReservada: reservas.capacidadeReservada,
            dataInicio: reservas.dataInicio,
            dataFim: reservas.dataFim,
            valorTotal: reservas.valorTotal,
            status: reservas.status,
            pagamentoStatus: reservas.pagamentoStatus,
            contratoUrl: reservas.contratoUrl,
            createdAt: reservas.createdAt,
          })
          .from(reservas)
          .leftJoin(silos, eq(reservas.siloId, silos.id))
          .leftJoin(users, eq(reservas.produtorId, users.id))
          .where(and(...conditions));
        
        // Filtro de busca por texto (nome do silo ou produtor)
        if (filters.busca) {
          const searchTerm = filters.busca.toLowerCase();
          results = results.filter(r => 
            r.siloNome?.toLowerCase().includes(searchTerm) ||
            r.produtorNome?.toLowerCase().includes(searchTerm) ||
            r.produtorEmail?.toLowerCase().includes(searchTerm)
          );
        }
        
        return results;
      }),

    // Cancelar reserva (cliente) - restaura capacidade
    cancel: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Buscar a reserva
        const [reserva] = await ctx.db.select().from(reservas).where(eq(reservas.id, input.reservaId));
        
        if (!reserva) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }
        
        // Verificar se o usuário é o dono da reserva
        if (reserva.produtorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não tem permissão para cancelar esta reserva' });
        }
        
        // Verificar se a reserva já foi cancelada
        if (reserva.status === 'cancelada') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta reserva já foi cancelada' });
        }
        
        // Atualizar status da reserva
        await ctx.db.update(reservas)
          .set({ status: 'cancelada' })
          .where(eq(reservas.id, input.reservaId));
        
        // Registrar no histórico
        await historicoService.registrarAcao(
          input.reservaId,
          ctx.user.id,
          'cancelada',
          'Reserva cancelada pelo cliente'
        );
        
        // Restaurar capacidade do silo
        const [silo] = await ctx.db.select().from(silos).where(eq(silos.id, reserva.siloId));
        if (silo) {
          const novaCapacidade = (silo.capacidadeDisponivel || 0) + reserva.capacidadeReservada;
          await ctx.db.update(silos)
            .set({ capacidadeDisponivel: novaCapacidade })
            .where(eq(silos.id, reserva.siloId));
        }
        
        return { success: true, message: 'Reserva cancelada com sucesso' };
      }),

    // Aprovar reserva (proprietário)
    approve: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Buscar a reserva
        const [reserva] = await ctx.db.select().from(reservas).where(eq(reservas.id, input.reservaId));
        
        if (!reserva) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }
        
        // Verificar se o usuário é o dono do silo
        const [silo] = await ctx.db.select().from(silos).where(eq(silos.id, reserva.siloId));
        if (!silo || silo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não tem permissão para aprovar esta reserva' });
        }
        
        // Verificar se a reserva já foi aprovada
        if (reserva.status === 'confirmada') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta reserva já foi aprovada' });
        }
        
        // Buscar dados do produtor para enviar e-mail
        const [produtor] = await ctx.db.select().from(users).where(eq(users.id, reserva.produtorId));
        
        // Atualizar status da reserva
        await ctx.db.update(reservas)
          .set({ status: 'confirmada' })
          .where(eq(reservas.id, input.reservaId));
        
        // Registrar no histórico
        await historicoService.registrarAcao(
          input.reservaId,
          ctx.user.id,
          'aprovada',
          'Reserva aprovada pelo proprietário'
        );
        
        // Enviar e-mail de notificação ao cliente
        if (produtor && produtor.email) {
          await emailService.sendReservaAprovadaEmail(
            produtor.email,
            produtor.name || 'Cliente',
            silo.nome || `Silo #${silo.id}`,
            reserva.capacidadeReservada,
            reserva.dataInicio,
            reserva.dataFim,
            reserva.valorTotal
          );
        }
        
        return { success: true, message: 'Reserva aprovada com sucesso' };
      }),

    // Rejeitar reserva (proprietário) - restaura capacidade
    reject: protectedProcedure
      .input(z.object({ reservaId: z.number(), motivo: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        // Buscar a reserva
        const [reserva] = await ctx.db.select().from(reservas).where(eq(reservas.id, input.reservaId));
        
        if (!reserva) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }
        
        // Verificar se o usuário é o dono do silo
        const [silo] = await ctx.db.select().from(silos).where(eq(silos.id, reserva.siloId));
        if (!silo || silo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não tem permissão para rejeitar esta reserva' });
        }
        
        // Verificar se a reserva já foi rejeitada
        if (reserva.status === 'rejeitada') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta reserva já foi rejeitada' });
        }
        
        // Buscar dados do produtor para enviar e-mail
        const [produtor] = await ctx.db.select().from(users).where(eq(users.id, reserva.produtorId));
        
        // Atualizar status da reserva
        await ctx.db.update(reservas)
          .set({ status: 'rejeitada' })
          .where(eq(reservas.id, input.reservaId));
        
        // Registrar no histórico
        await historicoService.registrarAcao(
          input.reservaId,
          ctx.user.id,
          'rejeitada',
          input.motivo || 'Reserva rejeitada pelo proprietário'
        );
        
        // Restaurar capacidade do silo
        const novaCapacidade = (silo.capacidadeDisponivel || 0) + reserva.capacidadeReservada;
        await ctx.db.update(silos)
          .set({ capacidadeDisponivel: novaCapacidade })
          .where(eq(silos.id, reserva.siloId));
        
        // Enviar e-mail de notificação ao cliente
        if (produtor && produtor.email) {
          await emailService.sendReservaRejeitadaEmail(
            produtor.email,
            produtor.name || 'Cliente',
            silo.nome || `Silo #${silo.id}`,
            reserva.capacidadeReservada,
            reserva.dataInicio,
            reserva.dataFim,
            reserva.valorTotal,
            input.motivo
          );
        }
        
        return { success: true, message: 'Reserva rejeitada com sucesso' };
      }),

    // Buscar detalhes completos de uma reserva
    getReservaDetails: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Buscar reserva com todos os dados relacionados
        const [reservaData] = await ctx.db
          .select()
          .from(reservas)
          .where(eq(reservas.id, input.reservaId));

        if (!reservaData) {
          throw new TRPCError({ 
            code: 'NOT_FOUND', 
            message: 'Reserva não encontrada' 
          });
        }

        // Buscar dados do silo
        const [silo] = await ctx.db
          .select()
          .from(silos)
          .where(eq(silos.id, reservaData.siloId));

        // Buscar dados do produtor
        const [produtor] = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, reservaData.produtorId));

        // Buscar dados do proprietário
        const [proprietario] = silo ? await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, silo.userId)) : [null];

        // Verificar permissão
        const isProdutor = reservaData.produtorId === ctx.user.id;
        const isProprietario = silo && silo.userId === ctx.user.id;

        if (!isProdutor && !isProprietario) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'Você não tem permissão para visualizar esta reserva' 
          });
        }

        return {
          reserva: reservaData,
          silo: silo || null,
          produtor: produtor || null,
          proprietario: proprietario || null,
          userRole: isProdutor ? 'produtor' : 'proprietario'
        };
      }),

    // Buscar histórico de uma reserva
    getReservaHistorico: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verificar se a reserva existe e se o usuário tem permissão
        const [reserva] = await ctx.db
          .select()
          .from(reservas)
          .where(eq(reservas.id, input.reservaId));

        if (!reserva) {
          throw new TRPCError({ 
            code: 'NOT_FOUND', 
            message: 'Reserva não encontrada' 
          });
        }

        // Verificar permissão
        const [silo] = await ctx.db
          .select()
          .from(silos)
          .where(eq(silos.id, reserva.siloId));

        const isProdutor = reserva.produtorId === ctx.user.id;
        const isProprietario = silo && silo.userId === ctx.user.id;

        if (!isProdutor && !isProprietario) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'Você não tem permissão para visualizar o histórico desta reserva' 
          });
        }

        // Buscar histórico
        const historico = await historicoService.buscarHistorico(input.reservaId);
        
        // Buscar nomes dos usuários que fizeram as ações
        const historicoComNomes = await Promise.all(
          historico.map(async (item) => {
            const [usuario] = await ctx.db
              .select({ name: users.name })
              .from(users)
              .where(eq(users.id, item.userId));
            
            return {
              ...item,
              userName: usuario?.name || 'Usuário desconhecido'
            };
          })
        );

        return historicoComNomes;
      }),

    // Dashboard do proprietário
    dashboard: protectedProcedure
      .input(z.object({
        period: z.enum(["current_month", "last_3_months", "last_6_months", "last_year", "all_time"]).optional().default("current_month"),
        siloId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const period = input?.period || "current_month";
        const siloId = input?.siloId;
        return getDashboardStatsV2(ctx.user.id, period, siloId);
      }),
  }),

  // Avaliações
  avaliacoes: router({
    // Criar avaliação
    create: protectedProcedure
      .input(z.object({
        siloId: z.number(),
        reservaId: z.number(),
        nota: z.number().min(1).max(5),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createAvaliacao({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Listar avaliações de um silo
    listBySilo: publicProcedure
      .input(z.object({
        siloId: z.number(),
      }))
      .query(async ({ input }) => {
        return getAvaliacoesBySilo(input.siloId);
      }),

    // Verificar se pode avaliar
    canReview: protectedProcedure
      .input(z.object({
        siloId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return canUserReview(ctx.user.id, input.siloId);
      }),
  }),

  // Mensagens
  messages: router({
    // Buscar ou criar conversa
    getOrCreateConversation: protectedProcedure
      .input(z.object({
        otherUserId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return getOrCreateConversation(ctx.user.id, input.otherUserId);
      }),

    // Listar conversas
    listConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserConversations(ctx.user.id);
      }),

    // Buscar mensagens de uma conversa
    getMessages: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return getConversationMessages(input.conversationId, ctx.user.id);
      }),

    // Enviar mensagem
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        receiverId: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return sendMessage({
          ...input,
          senderId: ctx.user.id,
        });
      }),

    // Marcar mensagens como lidas
    markAsRead: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return markMessagesAsRead(input.conversationId, ctx.user.id);
      }),

    // Contar mensagens não lidas
    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return getUnreadCount(ctx.user.id);
      }),
  }),

  // Pagamentos
  pagamentos: router({
    // Criar sessão de checkout
    createCheckout: protectedProcedure
      .input(z.object({
        reservaId: z.number(),
        valor: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createCheckoutSession({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Listar pagamentos de uma reserva
    listByReserva: protectedProcedure
      .input(z.object({
        reservaId: z.number(),
      }))
      .query(async ({ input }) => {
        return getPagamentosByReserva(input.reservaId);
      }),

    // Listar pagamentos do usuário
    listByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return getPagamentosByUser(ctx.user.id);
      }),
  }),

  // Contratos
  contratos: router({
    // Gerar contrato
    gerar: protectedProcedure
      .input(z.object({
        reservaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return gerarContrato(input.reservaId);
      }),

    // Assinar contrato
    assinar: protectedProcedure
      .input(z.object({
        contratoId: z.number(),
        ipAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return assinarContrato(input.contratoId, ctx.user.id, input.ipAddress);
      }),

    // Buscar contrato de uma reserva
    getByReserva: protectedProcedure
      .input(z.object({
        reservaId: z.number(),
      }))
      .query(async ({ input }) => {
        return getContratoByReserva(input.reservaId);
      }),

    // Listar contratos do usuário
    listByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return getContratosByUser(ctx.user.id);
      }),
  }),

  // Perfil do usuário
  profile: router({
    // Atualizar perfil
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        telefone: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return updateProfile(ctx.user.id, input);
      }),

    // Alterar senha
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        return changePassword(ctx.user.id, input.currentPassword, input.newPassword);
      }),
  }),

  // Relatórios
  relatorios: router({
    // Exportar relatório de reservas
    exportarReservas: protectedProcedure
      .input(z.object({
        format: z.enum(["csv", "json"]).optional().default("csv"),
      }))
      .query(async ({ ctx, input }) => {
        return generateReservasReport(ctx.user.id, input.format);
      }),

    // Exportar relatório de silos
    exportarSilos: protectedProcedure
      .input(z.object({
        format: z.enum(["csv", "json"]).optional().default("csv"),
      }))
      .query(async ({ ctx, input }) => {
        return generateSilosReport(ctx.user.id, input.format);
      }),
  }),
});

export type AppRouter = typeof appRouter;
