# System Resume — Filmin

Documento de referência completo do sistema Filmin: arquitetura, regras de negócio, módulos, nomenclatura e funcionamento geral.

---

## Visão Geral

**Filmin** é um PWA (Progressive Web App) para gerenciamento de filmes, séries e livros com foco em uso pessoal ou em dupla (**Modo Duo**). O objetivo central é resolver "o que assistir/ler hoje", gamificar o consumo de mídia e criar interação entre dois usuários.

---

## Stack Técnica

### Backend (`apps/api`)
- **Framework**: NestJS (modular, com decorators)
- **ORM**: TypeORM com PostgreSQL (Supabase como host)
- **Autenticação**: JWT via Supabase (validação por JWKS)
- **IA**: Groq SDK (LLM para o assistente Theo)
- **Notificações**: SSE via RxJS
- **Docs**: Swagger UI em `/api`

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Animações**: Framer Motion
- **State/Cache**: TanStack React Query
- **HTTP Client**: Axios centralizado em `lib/api/client.ts`
- **Auth**: Supabase SSR + Client (`@supabase/ssr`)
- **Ícones**: Lucide React

### Infra
- **Monorepo**: `apps/api` e `apps/web`
- **Deploy**: Vercel (web) + Render (api)
- **DB Host**: Supabase (PostgreSQL)

---

## Estrutura do Monorepo

```
filmin/
├── apps/
│   ├── api/                    ← NestJS backend
│   │   └── src/
│   │       ├── modules/        ← Um módulo por domínio
│   │       ├── common/enums/   ← Enums compartilhados
│   │       └── database/       ← Data source + migrations
│   └── web/                    ← Next.js frontend
│       └── src/
│           ├── app/            ← Rotas (App Router)
│           ├── components/     ← Componentes por domínio
│           ├── lib/api/        ← SDK de chamadas ao backend
│           ├── lib/auth/       ← Contexto e guard de auth
│           ├── lib/hooks/      ← Custom hooks
│           └── types/          ← Contratos e interfaces
└── .claude/                    ← Contexto para IA
```

---

## Módulos do Backend

### `auth`
- Validação de JWT via Supabase JWKS
- `JwtAuthGuard` — guard global aplicado em todas as rotas (exceto `@Public()`)
- Cria `Profile` automaticamente no primeiro login
- Injeta `AuthenticatedUser` em `request.user`
- Endpoint: `GET /auth/me`

### `profiles`
- Entidade `Profile` vinculada ao `supabase_user_id`
- Campos: `firstName`, `lastName`, `genero`, `email`, `isPrivate`
- Suporte a perfis públicos/privados
- Rastreamento de visitantes via `ProfileViewer`
- Endpoints: busca pública, atualização, stats, viewers (Stalkers)

### `groups`
- Unidade central de isolamento de dados
- Tipos: `SOLO` (1 membro) e `DUO` (2 membros)
- `invite_code` de 8 caracteres para entrada no Duo
- Fluxos:
  - `createSolo` — onboarding inicial
  - `createDuo` — cria grupo duo (garante solo previamente)
  - `joinByInviteCode` — entra em duo via código
  - `leaveDuo` — sai do duo: clona itens para ambos os solos + dissolve grupo
- Advisory lock para evitar race conditions na criação de grupo solo
- Notifica via SSE ao entrar/sair de grupo

### `watch-items`
- CRUD central de mídia (filmes, séries, livros)
- Campos principais:
  - `tipo`: `filme` | `serie` | `livro`
  - `status`: `quero_assistir` | `assistindo` | `assistido` | `abandonado`
  - `notaDele`, `notaDela`, `notaGeral` — notas independentes por membro
  - `ratingStatus`, `pendingForProfileId` — controle de sincronização Duo
  - `posterUrl`, `tmdbId`, `googleBooksId` — referências externas
- Todo item é isolado por `group_id`
- Suporte a filtros por `status`, `tipo`, `genero`

### `temporadas`
- Controle de progresso para séries
- Vinculada a `WatchItem` via `watchItemId`
- Campos: `numero`, `notaDele`, `notaDela`, `notaGeral`

### `generos`
- Categorização de itens (Ação, Drama, etc.)
- Relação M:N com `WatchItem` via tabela `watch_item_generos`

### `streak`
- Sistema de "foguinho" por grupo
- Tipos: `daily` | `weekend` | `monthly`
- Campos: `sequenciaAtual`, `maiorSequencia`, `ultimoRegistroEm`, `periodoAtualValido`
- Incrementa ao criar `WatchItem` ou adicionar nota
- Reset automático ao quebrar o período
- Toda lógica de cálculo isolada em `streak.utils.ts`
- Progressão de cores: 0–9 🟠, 10–29 🟡, 30–59 🔵, 60+ 🟣

### `achievements`
- Sistema de conquistas (medalhas) baseadas em marcos
- Definições centralizadas em `achievement-defs.ts`
- Tipos disponíveis:
  - Cinéfilo I/II/III (10/30/50 filmes)
  - Maratonista I/II/III (5/10/20 séries)
  - Leitor Ávido I/II/III (10/20/50 livros)
  - Colecionador I/II/III (50/100/200 itens totais)
  - Alma Gêmea (10 itens com nota igual ao parceiro — duo_only)
- Escopo: `solo_duo` (todos) ou `duo_only` (apenas grupos duo)

### `theo`
- Assistente de IA baseado em Groq
- Persona: "Theo" — amigo cinéfilo com humor ácido e cultura pop anos 2000
- Módulos internos:
  - `theo.service.ts` — orquestrador principal
  - `theo-groq.service.ts` — chamadas ao LLM
  - `theo-memory.service.ts` — persistência de histórico de conversa
  - `theo-recommendation.service.ts` — lógica de recomendação com acervo
  - `theo-debate.service.ts` — modo debate entre membros Duo
  - `theo-intent.parser.ts` — extração de intenção da resposta
  - `theo-persona.ts` — system prompt base + addendums (Duo, Família)
- Modo Família: comportamento especial para emails cadastrados em `FAMILY_EMAILS`
- Resposta sempre em JSON: `{ intent, message, suggestions }`

### `tmdb`
- Integração com The Movie Database
- Frontend → Backend → TMDB (nunca direto do frontend)
- Mapper transforma dados brutos para padrão interno
- Rotas: `GET /tmdb/search?query=`, `GET /tmdb/:id`
- Imagens: `https://image.tmdb.org/t/p/w500/{poster_path}`
- API KEY apenas no backend (`.env`)

### `books`
- Integração com Google Books
- Frontend → Backend → Google Books (nunca direto do frontend)
- Mapper normaliza dados inconsistentes
- Thumbnails: http → https
- Rotas: `GET /books/search?query=`, `GET /books/:id`
- Não requer API key (uso público)

### `stats`
- Endpoint de retrospectiva: `GET /stats/retrospective?period=month|quarter|year|all`
- Métricas calculadas:
  - Total de itens por tipo
  - Gênero favorito (GROUP BY)
  - Notas médias (por membro no Duo)
  - Item destaque (melhor/pior avaliado)
  - Tempo de tela estimado (filme = 2h, série = 10h médio)
  - Maior streak do período
- Performance crítica: queries agregadas — considerar cache no futuro

### `notifications`
- Engine SSE (Server-Sent Events)
- Eventos emitidos:
  - `member_joined` — novo membro entrou no duo
  - `duo_dissolved` — parceiro saiu do duo
  - `nudge` — cutucada entre membros
- Frontend consome via `useNotifications` hook

### `nudges`
- Sistema de "cutucadas" entre membros duo
- Geração com IA (`nudge-ai.service.ts`)
- Tipos definidos em `NudgeType` enum

---

## Modelo de Dados (Entidades Principais)

```
Profile
  id (uuid)
  supabase_user_id (uuid, unique)
  email, first_name, last_name
  genero (enum: masculino | feminino | outro)
  is_private (boolean)

Group
  id (uuid)
  tipo (enum: SOLO | DUO)
  invite_code (varchar, nullable)

GroupMember
  id (uuid)
  group_id → Group
  profile_id → Profile

WatchItem
  id (uuid)
  titulo, titulo_original
  ano_lancamento (int, nullable)
  tipo (enum: filme | serie | livro)
  status (enum: quero_assistir | assistindo | assistido | abandonado)
  nota_dele, nota_dela, nota_geral (decimal 3,1 nullable)
  data_assistida (date, nullable)
  rewatch_count (int, default 0)
  observacoes (text, nullable)
  poster_url (text, nullable)
  rating_status (enum, nullable) ← sincronização Duo
  pending_for_profile_id (uuid, nullable)
  first_rating_by_profile_id (uuid, nullable)
  first_rating_field (enum: notaDele | notaDela)
  last_rating_at (timestamptz, nullable)
  group_id → Group
  origin_group_id (uuid, nullable) ← clone de duo para solo

Temporada
  id (uuid)
  watch_item_id → WatchItem
  numero (int)
  nota_dele, nota_dela, nota_geral (decimal nullable)

Genero
  id (uuid)
  nome (varchar)

Streak
  id (uuid)
  group_id → Group
  tipo (enum: daily | weekend | monthly)
  sequencia_atual, maior_sequencia (int)
  ultimo_registro_em (timestamptz)
  periodo_atual_valido (boolean)

Achievement
  id (uuid)
  group_id → Group
  slug (varchar, unique por grupo)
  desbloqueada_em (timestamptz)

TheoMemory
  id (uuid)
  group_id → Group
  historico (jsonb) ← mensagens da sessão
```

---

## Nomenclatura e Convenções

### Backend
- Arquivos: `kebab-case` (ex: `watch-items.service.ts`)
- Classes: `PascalCase`
- Variáveis/props: `camelCase`
- Colunas DB: `snake_case`
- Enums: em `src/common/enums/`
- Módulos: um por domínio em `src/modules/`
- DTOs: em subpasta `dto/` dentro de cada módulo
- Entidades: em subpasta `entities/`
- Comentários: **sempre em Português – Brasil**

### Frontend
- Componentes: `kebab-case` para arquivo, `PascalCase` para export
- Hooks: `use-*` (ex: `use-streak.ts`)
- API calls: em `lib/api/` (um arquivo por domínio)
- Tipos: em `types/` (contratos das respostas da API)
- Rotas privadas: `GroupGuard` em `lib/auth/group-guard.tsx`

### Banco de Dados
- Tabelas: `snake_case` plural (ex: `watch_items`, `group_members`)
- Colunas: `snake_case`
- PKs: UUID gerado automaticamente
- Enums: sufixo `_enum` no nome do tipo (ex: `watch_item_status_enum`)

---

## Regras de Negócio Críticas

1. **Todo dado de consumo é isolado por `group_id`** — nunca misturar dados entre grupos.
2. **Usuário sem grupo não acessa o sistema** — `GroupGuard` bloqueia no frontend.
3. **Duo tem prioridade sobre Solo** — ao retornar `groupId`, o duo prevalece.
4. **Streak é calculado sempre no backend** — nunca confiar em timestamps do cliente.
5. **Integrações externas (TMDB, Books) passam sempre pelo backend** — nunca chamar do frontend.
6. **Ao sair do Duo, itens são clonados para ambos os solos** — operação transacional, tudo ou nada.
7. **Notas do Duo são independentes** — `notaDele` e `notaDela` são campos separados.
8. **Advisory lock na criação de grupo solo** — evitar duplicatas em requisições concorrentes.
9. **Achievements `duo_only` só são desbloqueados em grupos Duo**.

---

## Rotas do Frontend

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard principal (WatchItems) |
| `/login` | Autenticação via Supabase |
| `/cadastro` | Registro de novo usuário |
| `/onboarding` | Fluxo inicial: criar Solo ou entrar em Duo |
| `/convite/[code]` | Aceitar convite de Duo |
| `/match` | Modo Match — votação Duo (swipe) |
| `/escolha-rapida` | Sorteio aleatório (Solo) |
| `/theo` | Assistente de IA |
| `/retrospectiva` | Estatísticas estilo Spotify Wrapped |
| `/conquistas` | Sistema de achievements |
| `/conquistas/leaderboard/[category]` | Ranking por categoria |
| `/perfil/[id]` | Perfil social público |
| `/configuracoes` | Configurações do usuário |
| `/series/[id]/temporadas` | Gestão de temporadas |
| `/search` | Busca unificada (TMDB + Books) |

---

## Princípios do Projeto

- **Simplicidade > Complexidade** — evitar overengineering
- **Foco em experiência tátil e visual** — Framer Motion em interações chave
- **Arquitetura pronta para novos tipos de mídia**
- **Modo Duo como diferencial** — funcionalidades exclusivas para casais
- **Arquivos ≤ 300 linhas** — modularizar quando necessário
- **Comentários sempre em Português – Brasil**
