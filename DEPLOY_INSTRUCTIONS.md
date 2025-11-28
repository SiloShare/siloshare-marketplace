# Deploy do SiloShare na Vercel com Domínio Customizado

## Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

## Passo 2: Fazer Login na Vercel
```bash
vercel login
```

## Passo 3: Deploy do Projeto
```bash
cd /home/ubuntu/siloshare_v2
vercel --prod
```

## Passo 4: Configurar Domínio Customizado
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto siloshare_v2
3. Vá em "Settings" > "Domains"
4. Adicione o domínio: siloshare.com.br
5. Vercel fornecerá os registros DNS

## Passo 5: Configurar DNS na HostGator
Adicione os seguintes registros no painel da HostGator:

**Registro A:**
- Nome: @
- Tipo: A
- Valor: 76.76.21.21

**Registro CNAME:**
- Nome: www
- Tipo: CNAME
- Valor: cname.vercel-dns.com

## Passo 6: Aguardar Propagação
- Tempo estimado: 5-30 minutos
- Verificar em: https://dnschecker.org

## Variáveis de Ambiente
Configure na Vercel Dashboard:
- NODE_ENV=production
- DATABASE_URL=(se usar PostgreSQL)

## URLs Finais
- https://siloshare.com.br
- https://www.siloshare.com.br
