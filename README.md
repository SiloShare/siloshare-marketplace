# 🌾 SiloShare - Marketplace de Armazenagem e Transporte de Grãos

## 📌 Visão Geral

**SiloShare** é o primeiro marketplace digital do Brasil que conecta donos de silos com capacidade ociosa, produtores rurais que precisam de armazenagem e transportadoras, criando um ecossistema integrado para otimizar a logística de grãos no país.

### O Problema

O Brasil enfrenta um **paradoxo crítico** na armazenagem de grãos:
- 🔴 **95,2 milhões de toneladas** sem espaço adequado de armazenagem (déficit de 29,5%)
- 🟠 **40-50% dos silos** ficam ociosos durante 5-6 meses por ano
- 🟡 **15-30% do valor da produção** é perdido em logística ineficiente

### A Solução

Plataforma digital que:
1. ✅ Conecta oferta e demanda de armazenagem em tempo real
2. ✅ Integra cotação automática de transporte
3. ✅ Otimiza logística através de geolocalização
4. ✅ Reduz custos para produtores e monetiza capacidade ociosa de silos
5. ✅ Oferece segurança com contratos digitais e sistema de avaliações

---

## 🚀 Status do Projeto

### ✅ Implementado

- [x] Landing page completa e responsiva
- [x] Sistema de gerenciamento de estado com Zustand
- [x] Store de Silos (cadastro, busca, filtros)
- [x] Store de Reservas (criação, gestão, cotações de transporte)
- [x] Store de Autenticação (login, registro, perfis de usuário)
- [x] Design profissional com Tailwind CSS + shadcn/ui
- [x] Documentação executiva completa

### 🔄 Em Desenvolvimento

- [ ] Backend com Node.js + Express
- [ ] Banco de dados PostgreSQL
- [ ] Sistema de pagamentos (Stripe/Mercado Pago)
- [ ] Integração com APIs de geolocalização
- [ ] Dashboard para donos de silos
- [ ] Sistema de cotação automática de transporte

### 📋 Planejado

- [ ] App mobile (PWA)
- [ ] Chat entre usuários
- [ ] IA para otimização de rotas
- [ ] Integração com IoT (sensores de silos)
- [ ] Marketplace de insumos
- [ ] Sistema de crédito/financiamento

---

## 💻 Stack Tecnológico

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Zustand** - Gerenciamento de estado
- **Wouter** - Roteamento client-side

### Backend (Planejado)
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma** - ORM
- **JWT** - Autenticação

### DevOps
- **Vercel** - Hospedagem frontend
- **Railway/Render** - Hospedagem backend
- **GitHub** - Controle de versão
- **pnpm** - Gerenciador de pacotes

---

## 📂 Estrutura do Projeto

```
siloshare_v2/
├── client/                          # Frontend React
│   ├── public/                      # Arquivos estáticos
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   └── ui/                  # Componentes shadcn/ui
│   │   ├── contexts/                # Contextos React
│   │   ├── hooks/                   # Custom hooks
│   │   ├── lib/                     # Utilitários
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── Home.tsx             # Landing page
│   │   │   └── NotFound.tsx         # Página 404
│   │   ├── stores/                  # Stores Zustand
│   │   │   ├── siloStore.ts         # Gerenciamento de silos
│   │   │   ├── reservationStore.ts  # Gerenciamento de reservas
│   │   │   └── authStore.ts         # Autenticação
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── const.ts                 # Constantes
│   │   ├── index.css                # Estilos globais
│   │   └── main.tsx                 # Entry point
│   ├── index.html
│   └── vite.config.ts
├── server/                          # Backend (placeholder)
├── shared/                          # Código compartilhado
├── RESUMO_EXECUTIVO_SILOSHARE.md    # Resumo executivo do negócio
├── marketplace_silos_analise_expandida.md  # Análise de mercado
├── guia_pesquisa_campo_siloshare.md # Guia de pesquisa de campo
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md                        # Este arquivo
```

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos

- Node.js 22.x ou superior
- pnpm 10.x ou superior

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/siloshare_v2.git

# Entre no diretório
cd siloshare_v2

# Instale as dependências
pnpm install
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
pnpm run dev

# Acesse no navegador
# http://localhost:3000
```

### Build para Produção

```bash
# Gerar build otimizado
pnpm run build

# Visualizar build localmente
pnpm run preview
```

---

## 📊 Modelo de Negócio

### Fontes de Receita

1. **Comissão sobre Armazenagem (5-10%)**
   - Cobrada sobre cada transação de reserva de silo
   - Receita recorrente mensal

2. **Comissão sobre Transporte (8-12%)**
   - Cobrada sobre cada frete contratado pela plataforma
   - Receita por transação

3. **Planos Premium (Futuro)**
   - Recursos avançados para donos de silos
   - R$ 199-499/mês

4. **Publicidade e Parcerias (Futuro)**
   - Anúncios de insumos agrícolas
   - Parcerias com cooperativas

### Projeções Financeiras

| Ano | Silos | Produtores | Transações/Mês | Receita Anual |
|-----|-------|------------|----------------|---------------|
| 1   | 50    | 200        | 10             | R$ 294.000    |
| 2   | 150   | 600        | 30             | R$ 882.000    |
| 3   | 300   | 1.200      | 60             | R$ 1.764.000  |

---

## 🎯 Roadmap

### Fase 1: Validação (Meses 1-3)
- [x] Desenvolvimento do MVP
- [x] Documentação executiva
- [ ] Pesquisa de campo com 50 produtores
- [ ] Validação com 10 silos piloto
- [ ] Primeiras 20 transações

### Fase 2: MVP Completo (Meses 4-6)
- [ ] Backend funcional
- [ ] Sistema de pagamentos
- [ ] Cotação automática de transporte
- [ ] Dashboard para silos
- [ ] App mobile (PWA)

### Fase 3: Escala Regional (Meses 7-12)
- [ ] 50 silos cadastrados
- [ ] 200 produtores ativos
- [ ] 30 transportadoras
- [ ] Marketing digital agressivo
- [ ] Parcerias com cooperativas

### Fase 4: Expansão Nacional (Ano 2)
- [ ] Presença em 5 estados (MT, MS, GO, PR, RS)
- [ ] 200+ silos
- [ ] 1.000+ produtores
- [ ] Série A (R$ 3-5 milhões)

---

## 📚 Documentação

### Documentos Disponíveis

1. **[RESUMO_EXECUTIVO_SILOSHARE.md](./RESUMO_EXECUTIVO_SILOSHARE.md)**
   - Visão geral do negócio
   - Modelo de negócio
   - Projeções financeiras
   - Estratégia de go-to-market
   - Necessidades de investimento

2. **[marketplace_silos_analise_expandida.md](./marketplace_silos_analise_expandida.md)**
   - Contexto do mercado
   - Análise competitiva
   - Segmentação de mercado
   - Análise de viabilidade
   - Estratégias de crescimento
   - Benchmarking internacional

3. **[guia_pesquisa_campo_siloshare.md](./guia_pesquisa_campo_siloshare.md)**
   - Metodologia de pesquisa
   - Roteiros de entrevista (produtores, silos, transportadoras)
   - Análise e consolidação de dados
   - Checklist de execução

---

## 👥 Stakeholders

### 1. Produtores Rurais (Demanda)
- **Perfil:** Médios e grandes produtores (500-5.000 hectares)
- **Dor:** Falta de armazenagem próxima, preços altos, logística complexa
- **Valor:** Economia de 15-30% em custos logísticos

### 2. Donos de Silos (Oferta)
- **Perfil:** Cooperativas, empresas privadas, produtores com excesso
- **Dor:** 40-50% de capacidade ociosa anual
- **Valor:** Receita adicional de R$ 50k-200k/ano

### 3. Transportadoras (Serviço)
- **Perfil:** Freteiros independentes, empresas de transporte
- **Dor:** Rotas vazias, baixa ocupação
- **Valor:** Aumento de 20-30% na taxa de ocupação

---

## 🔑 Conceitos-Chave

### Não Misturar Grãos Diferentes
⚠️ **IMPORTANTE:** Diferentes tipos ou qualidades de grãos **NÃO devem** ser armazenados juntos devido a:
- Requisitos de umidade diferentes
- Segregação natural
- Taxas de respiração distintas
- Controle de qualidade

### Integração de Transporte
O SiloShare oferece **cotação automática** de transporte:
1. Produtor faz reserva de silo
2. Sistema envia cotação para transportadoras
3. Transportadoras enviam propostas
4. Produtor compara e escolhe a melhor
5. Plataforma ganha comissão sobre o frete

### Foco Geográfico Inicial
**Mato Grosso** é o mercado inicial:
- Maior produtor agrícola do Brasil (30% da produção nacional)
- 36 dos 100 municípios mais ricos no agronegócio
- Alta concentração de produtores e silos
- Déficit de armazenagem de ~35%

---

## 💼 Oportunidades de Investimento

### Seed Round: R$ 500.000

**Uso dos Recursos:**
- 40% Desenvolvimento de Produto (R$ 200.000)
- 30% Marketing e Vendas (R$ 150.000)
- 16% Operações e Infraestrutura (R$ 80.000)
- 8% Jurídico e Compliance (R$ 40.000)
- 6% Reserva (R$ 30.000)

**Equity Oferecido:** 15-20%  
**Valuation Pre-Money:** R$ 2-2,5 milhões  
**Runway:** 12-15 meses

---

## 📞 Contato

**Estamos buscando:**
- 💰 Investidores Seed (R$ 500k)
- 🤝 Parceiros Estratégicos (Cooperativas, associações)
- 👥 Co-fundadores (CTO e/ou COO)
- 🎯 Early Adopters (Produtores e donos de silos em MT)

**Entre em contato:**
- 📧 Email: contato@siloshare.com.br
- 📱 WhatsApp: (65) 99999-9999
- 🌐 Website: [siloshare.com.br](https://siloshare.com.br)

---

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

**© 2025 SiloShare. Conectando o Agronegócio Brasileiro.**

---

## 🙏 Agradecimentos

Agradecemos a todos que contribuíram para o desenvolvimento deste projeto:
- Produtores rurais que compartilharam suas dores e necessidades
- Cooperativas e associações do agronegócio
- Mentores e advisors
- Investidores que acreditam na nossa visão

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Status:** MVP em desenvolvimento

