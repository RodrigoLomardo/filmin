# Filmin — Contexto do Projeto

## Visão Geral

PWA para gerenciamento de filmes e séries com foco em uso pessoal ou em dupla (Duo).

Objetivo principal:
- Resolver “o que assistir”
- Criar interação entre usuários no modo Duo
- Manter simplicidade com arquitetura escalável

---

## Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind + Framer Motion
- TanStack Query
- Axios (centralizado em `lib/api`)

### Backend
- NestJS
- TypeORM
- PostgreSQL (Supabase)

### Infra
- Monorepo (`apps/api`, `apps/web`)
- Deploy: Vercel (web) + Render (api)

---

## Domínio

### Profiles
- Ligação com usuário do Supabase (`supabase_user_id`)

### Groups
- Unidade central do sistema
- Tipos:
  - Solo (1 usuário)
  - Duo (2 usuários)
- Possui `invite_code`

### WatchItems
- Representa filme ou série
- Campos principais:
  - status: `quero_assistir`, `assistindo`, `assistido`, `larguei`
  - tipo: `filme` | `serie`
- Relacionamentos:
  - pertence a `Group`
  - possui `Generos`
  - possui `Temporadas` (para séries)
- No modo Duo:
  - possui avaliação por ambos os membros

### Temporadas
- Controle de progresso de séries

---

## Funcionalidades principais

- Dashboard com filtros por status/tipo
- Cadastro e edição de itens
- Onboarding (Solo ou Duo)
- Convite por código
- Modo Match (decisão em dupla estilo swipe)

---

## Regras de funcionamento

- Todo dado é isolado por `group_id`
- Usuário não acessa sistema sem estar em grupo (`GroupGuard`)
- Sincronização via React Query (re-fetch + invalidação)

---

## Estrutura

### Backend (`apps/api`)
- `auth`: validação JWT (Supabase JWKS)
- `profiles`
- `groups`
- `watch-items`
- `generos`
- `temporadas`

### Frontend (`apps/web`)
- `/app`: rotas (login, onboarding, match, etc)
- `/components`: UI e domínio
- `/lib/api`: comunicação com backend
- `/lib/auth`: auth + guards
- `/types`: contratos tipados

---

## Direção do produto

Foco principal:
- interação entre usuários (Duo)
- facilitar decisão de consumo

Roadmap:
- integração com TMDB
- notificações
- estatísticas
- importação de dados

---

## Princípios

- simplicidade > complexidade
- evitar abstração precoce
- arquitetura pronta para escalar
- foco em experiência do usuário