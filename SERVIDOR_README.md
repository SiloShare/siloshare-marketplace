# 🚀 Guia do Servidor - SiloShare

## Iniciar Servidor

### Opção 1: Script Automático (Recomendado)
```bash
cd /home/ubuntu/siloshare_v2
./start-server.sh
```

### Opção 2: Manual
```bash
cd /home/ubuntu/siloshare_v2
pnpm dev
```

---

## URLs do Servidor

| Serviço | URL |
|---------|-----|
| Homepage | http://localhost:3000/ |
| tRPC API | http://localhost:3000/api/trpc |
| Health Check | http://localhost:3000/api/health |
| OAuth Callback | http://localhost:3000/api/oauth/callback |

---

## Verificar Status

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T15:23:45.716Z",
  "env": "development"
}
```

### Verificar Porta
```bash
lsof -i :3000
```

---

## Logs

### Ver logs em tempo real
```bash
tail -f /tmp/siloshare_server.log
```

### Ver últimas 50 linhas
```bash
tail -50 /tmp/siloshare_server.log
```

### Buscar erros nos logs
```bash
grep -i error /tmp/siloshare_server.log
```

---

## Parar Servidor

### Parar todos os processos
```bash
pkill -f "tsx watch server"
```

### Parar processo específico
```bash
kill <PID>
```

---

## Troubleshooting

### Problema: Porta 3000 ocupada

**Solução 1**: Matar processo na porta 3000
```bash
lsof -ti:3000 | xargs kill -9
```

**Solução 2**: O servidor automaticamente usa outra porta (3001, 3002, etc.)

### Problema: Servidor não inicia

**Verificar**:
1. Arquivo `.env` existe?
2. Dependências instaladas? (`pnpm install`)
3. Banco de dados rodando?

**Logs**:
```bash
tail -50 /tmp/siloshare_server.log
```

### Problema: tRPC não responde

**Verificar**:
1. Servidor rodando? (`curl http://localhost:3000/api/health`)
2. Rota correta? (`/api/trpc` e não `/trpc`)
3. Logs do servidor mostram requisições?

**Testar endpoint**:
```bash
curl -X POST http://localhost:3000/api/trpc/auth.me \
  -H "Content-Type: application/json"
```

---

## Desenvolvimento

### Hot Reload
O servidor usa `tsx watch` que reinicia automaticamente quando arquivos são modificados.

### Arquivos Monitorados
- `/server/**/*.ts` - Backend
- `/drizzle/**/*.ts` - Schema do banco

### Arquivos NÃO Monitorados
- `/client/**/*` - Frontend (gerenciado pelo Vite)
- `node_modules/`
- `.env`

---

## Variáveis de Ambiente

Arquivo: `.env`

### Obrigatórias
```env
DATABASE_URL=mysql://user:pass@localhost:3306/db
JWT_SECRET=your_secret_key_here
```

### Opcionais
```env
PORT=3000
NODE_ENV=development
OAUTH_SERVER_URL=https://auth.example.com
```

---

## Comandos Úteis

### Limpar tudo e reiniciar
```bash
pkill -9 -f "siloshare"
cd /home/ubuntu/siloshare_v2
./start-server.sh
```

### Verificar processos Node
```bash
ps aux | grep node | grep siloshare
```

### Verificar uso de memória
```bash
ps aux | grep node | awk '{print $2, $4, $11}' | sort -k2 -rn | head -10
```

---

## Estrutura de Logs

### Formato
```
[2025-10-22T15:23:45.716Z] GET /api/health
[2025-10-22T15:23:46.123Z] POST /api/trpc/auth.login
```

### Tipos de Requisições
- `GET /` - Homepage
- `GET /api/health` - Health check
- `POST /api/trpc/*` - Chamadas tRPC
- `GET /api/oauth/callback` - OAuth callback

---

## Dicas

1. **Sempre use o script `start-server.sh`** para evitar processos duplicados
2. **Monitore os logs** para identificar problemas rapidamente
3. **Use health check** para verificar se servidor está respondendo
4. **Reinicie o servidor** se houver comportamento estranho

---

## Suporte

Se encontrar problemas:
1. Verifique os logs: `tail -f /tmp/siloshare_server.log`
2. Verifique health check: `curl http://localhost:3000/api/health`
3. Reinicie o servidor: `./start-server.sh`

---

**Última atualização**: 22 de Outubro de 2025

