# Filmin — Roadmap & Arquitetura

Este documento descreve a arquitetura, as funcionalidades e o funcionamento técnico do projeto **Filmin**, um sistema de gerenciamento de acervo pessoal e compartilhado de filmes e séries.

## 🚀 Visão Geral

O Filmin resolve o problema de "o que vamos assistir hoje?". Usuários individuais (Solo) ou casais (Duo) gerenciam listas de interesse, acompanham o progresso de séries e usam funcionalidades interativas para decidir o próximo título. O comportamento do app se adapta automaticamente ao tipo de grupo do usuário.

---

## 🏗️ Arquitetura do Sistema

Monorepo estruturado em:

- **`apps/api`**: Backend em **NestJS 11**.
- **`apps/web`**: Frontend em **Next.js 15** (App Router).
- **`packages/`**: Pacotes compartilhados (em expansão).

### Fluxo de Autenticação
1. Usuário se autentica via **Supabase Auth** no frontend (email/senha).
2. No cadastro, dados de perfil (nome, sobrenome, gênero) são enviados ao Supabase `user_metadata`.
3. O JWT emitido pelo Supabase é enviado no header `Authorization` para a API.
4. O `JwtAuthGuard` valida o token via JWKS e chama `findOrCreateProfile`.
5. Na criação do perfil, `user_metadata` do JWT é lido para popular `firstName`, `lastName` e `genero` automaticamente.
6. `groupId` e `groupTipo` são resolvidos na mesma passagem e anexados ao `request.user`.

### Propagação de `groupTipo`
O `JwtAuthGuard` resolve `groupTipo` (solo/duo) a cada request e o disponibiliza em `AuthenticatedUser`. Isso permite que services de `watch-items` e `temporadas` apliquem regras de negócio diferentes conforme o tipo de grupo, sem queries adicionais.

---

## 🔧 Tecnologias Utilizadas

### Backend (`apps/api`)
- **Framework**: NestJS 11
- **ORM**: TypeORM
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase JWKS
- **Linguagem**: TypeScript
- **Validação**: class-validator + class-transformer (ValidationPipe global)

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS + Framer Motion
- **Estado/Cache**: TanStack Query (React Query)
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Cliente API**: fetch com interceptor de token JWT

---

## 📂 Módulos e Entidades (Backend)

### 1. Perfis (`Profiles`)
Armazena a relação entre o usuário do Supabase e o sistema interno.

**Campos:**
- `supabase_user_id`: chave de ligação com o Supabase Auth
- `email`: sincronizado no primeiro login
- `first_name`, `last_name`: populados via `user_metadata` do JWT na criação, editáveis via `PATCH /profiles/me`
- `genero`: enum `profile_genero_enum` (masculino, feminino, outro, prefiro_nao_dizer)

**Endpoints:**
- `GET /profiles/me` — retorna o perfil do usuário autenticado
- `PATCH /profiles/me` — atualiza nome, sobrenome e gênero

### 2. Grupos (`Groups`)
O coração da organização do acervo. Tudo no Filmin pertence a um grupo.

- **Solo**: 1 membro. Notas são individuais ("Minha nota"). Sem Modo Match.
- **Duo**: 2 membros. Notas duplas ("Ele"/"Ela"). Habilita Modo Match.
- `invite_code`: código único para o segundo membro entrar no grupo Duo.

**Endpoints:**
- `GET /groups/me`
- `POST /groups/solo`
- `POST /groups/duo`
- `POST /groups/join/:inviteCode`

### 3. Itens de Assistir (`WatchItems`)
Representa um filme, série ou livro.

- **Status**: `quero_assistir`, `assistindo`, `assistido`, `abandonado`
- **Tipo**: `filme`, `serie`, `livro`
- **Notas**:
  - Solo: apenas `notaDele` obrigatória; `notaGeral = notaDele`
  - Duo: `notaDele` e `notaDela` obrigatórias; `notaGeral = média`
- Escopado por `groupId` — isolamento total entre grupos

### 4. Temporadas (`Temporadas`)
Rastreamento de progresso por temporada para séries.

- **Notas**:
  - Solo: `notaDele` obrigatória, `notaDela` ignorada; `notaGeral = notaDele`
  - Duo: ambas obrigatórias; `notaGeral = média`
- `notaGeral` da série é recalculada automaticamente ao salvar uma temporada

### 5. Gêneros (`Generos`)
Tags de categoria (Terror, Comédia, etc.) vinculadas aos itens. Endpoint público.

---

## 📱 Funcionalidades do Frontend

### 1. Autenticação
- Login e cadastro com email/senha via Supabase Auth
- Cadastro coleta nome, sobrenome e gênero (salvos no `user_metadata` do Supabase)
- Confirmação de email com `emailRedirectTo` → `/auth/callback`
- Rota `/auth/callback` troca o code por sessão e redireciona ao app

### 2. Modal de Perfil
Acessível pelo avatar no header. Seções:
- **Dados do perfil**: nome, sobrenome e gênero — editáveis via `PATCH /profiles/me`
- **Conta**: email e senha — alterados via `supabase.auth.updateUser()`
- **Sair da conta**

### 3. Onboarding
- Pós-login, `GET /groups/me` decide o fluxo: sem grupo → `/onboarding`
- Escolha entre Solo e Duo
- Duo: exibe `inviteCode` para compartilhamento
- Convite: `/convite/[code]` chama `POST /groups/join/:inviteCode`

### 4. Dashboard de Acervo
- Filtros por tipo (Filme/Série/Livro) e status
- Cards com notas adaptadas ao tipo de grupo (Solo: "Nota X" / Duo: "Ele X / Ela Y")

### 5. Modo Match (exclusivo Duo)
- Interface estilo Tinder — ambos votam nos itens "Quero Assistir"
- Match gerado quando os dois dão "Like"
- Acessível pelo FAB menu (exibido apenas para grupos Duo)

### 6. Escolha Rápida (exclusivo Solo)
- Substitui o Modo Match no FAB menu para usuários Solo
- Detecta automaticamente mobile/desktop e adapta a UI
- **Mobile**: instrução de shake + botão "Simular sacudida" (para testes); ao detectar 3 shakes, dispara animação de vibração de tela + flip 3D do card (rotateY com ease-out progressivo)
- **Desktop**: botão circular com progress ring SVG (pressionar e segurar 1,4s); animação de slide horizontal (slot machine)
- Tela idle exibe apresentação da feature + lista horizontal de filmes disponíveis
- Resultado revelado com spring animation + glow rosa

### 7. Gestão de Itens
- Cadastro manual de títulos (filme, série, livro)
- Edição de notas, status, data assistida, pôster e observações
- Notas adaptadas ao grupo: Solo exibe campo único; Duo exibe dois campos
- Temporadas com notas adaptadas (grid 2 colunas Solo / 3 colunas Duo)

---

## 🔄 Fluxo de Dados

1. **Proteção de Rotas**: `GroupGuard` no frontend bloqueia acesso sem grupo → `/onboarding`
2. **Sem sessão**: middleware/guard redireciona para `/login`
3. **Isolamento**: todas as queries de `watch-items` e `temporadas` são filtradas por `groupId`
4. **Adaptação por grupo**: `groupTipo` propagado do guard para os services — regras de notas, validações e UIs diferem entre Solo e Duo
5. **Cache**: TanStack Query com `queryKey: ['group']` compartilhado entre componentes (ProfileModal, useGroupTipo, etc.)

---

## 🗺️ Roadmap de Evolução

- [ ] **Integração com TMDB API**: busca automática de metadados e pôsteres
- [ ] **Notificações Push**: avisar quando a dupla adicionar item ou houver Match
- [ ] **Estatísticas**: gráficos de gêneros mais assistidos e concordância de notas
- [ ] **Filtros Avançados**: filtrar por gênero, ano e "voto dele/dela" no dashboard
- [ ] **Importação de Dados**: importar listas do Letterboxd ou Trakt

---

## 📂 Estrutura de Arquivos

### 🏠 Backend (`apps/api/src`)

#### `/modules`
- **`auth/`**: Autenticação JWT via JWKS do Supabase
  - `guards/jwt-auth.guard.ts`: resolve `profileId`, `groupId` e `groupTipo` a cada request
  - `auth.service.ts`: `findOrCreateProfile` (popula perfil com `user_metadata`), `getProfileGroup`
  - `interfaces/authenticated-user.interface.ts`: `{ supabaseUserId, email, profileId, groupId, groupTipo }`
- **`profiles/`**: CRUD de perfil do usuário
  - `entities/profile.entity.ts`: inclui `firstName`, `lastName`, `genero`
  - `profiles.controller.ts`: `GET /profiles/me`, `PATCH /profiles/me`
  - `profiles.service.ts`: `findById`, `update`
  - `dto/update-profile.dto.ts`
- **`groups/`**: Criação e adesão a grupos
- **`watch-items/`**: Conteúdo principal
  - Validação de notas ciente de `groupTipo` (Solo: só `notaDele`; Duo: ambas)
  - `notaGeral` calculada como `notaDele` (Solo) ou média (Duo)
- **`generos/`**: Categorias (público)
- **`temporadas/`**: Progresso de séries com mesma lógica de notas por `groupTipo`

#### `/database`
- **`migrations/`**: histórico de schema
  - `1775174400000-add-auth-domain`: cria `groups`, `profiles`, `group_members`
  - `1775174400001-add-group-id-to-watch-items`: escopamento por grupo
  - `1775200000000-add-profile-fields`: adiciona `first_name`, `last_name`, `genero` em `profiles`
- **`data-source.ts`**: configuração TypeORM

#### `/common/enums`
- `WatchItemStatus`, `WatchItemTipo`, `GroupTipo`, `GeneroUsuario`

---

### 🎨 Frontend (`apps/web/src`)

#### `/app`
- **`login/`**: login + cadastro (nome, sobrenome, gênero, email, senha)
- **`onboarding/`**: escolha Solo/Duo + exibição de invite code
- **`convite/[code]/`**: aceite de convite Duo
- **`match/`**: Modo Match (Duo)
- **`escolha-rapida/`**: Escolha Rápida (Solo) — detecção automática mobile/desktop
- **`auth/callback/`**: troca code por sessão pós-confirmação de email
- **`series/[id]/temporadas/`**: gestão de temporadas

#### `/components`
- **`profile-modal.tsx`**: `ProfileModal` + `AvatarButton` — edição de perfil e conta
- **`watch-items/`**:
  - `watch-item-card.tsx`: notas adaptadas ao `groupTipo`
  - `create-watch-item-form.tsx`: campos de nota condicionais
  - `edit-watch-item-form.tsx`: idem + temporadas com grid adaptado

#### `/lib`
- **`api/client.ts`**: fetch com Bearer token automático
- **`api/groups.ts`**: `getMyGroup`, `createSoloGroup`, `createDuoGroup`, `joinGroupByInviteCode`
- **`api/profile.ts`**: `getProfile`, `updateProfile`, tipos `Profile` e `GeneroUsuario`
- **`api/watch-items.ts`**: CRUD + `getMatchPool`
- **`auth/auth-context.tsx`**: `AuthProvider` com `signIn`, `signUp` (aceita `profileData`), `signOut`
- **`auth/group-guard.tsx`**: protege rotas privadas, redireciona sem grupo para `/onboarding`
- **`hooks/use-group-tipo.ts`**: hook compartilhado que lê `['group']` do cache TanStack Query
- **`supabase/client.ts`**: cliente browser (`@supabase/ssr`)
- **`supabase/server.ts`**: cliente server com cookie store
