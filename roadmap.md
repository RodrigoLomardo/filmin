# Filmin — Roadmap & Arquitetura

Este documento descreve a arquitetura, as funcionalidades e o funcionamento técnico do projeto **Filmin**, um sistema de gerenciamento de acervo pessoal e compartilhado de filmes e séries.

## 🚀 Visão Geral

O Filmin foi projetado para resolver o problema de "o que vamos assistir hoje?". Ele permite que usuários individuais ou casais (duplas) gerenciem suas listas de interesse, acompanhem o progresso de séries e utilizem um modo interativo (Match) para decidir o próximo título a ser assistido.

---

## 🏗️ Arquitetura do Sistema

O projeto é um monorepo estruturado da seguinte forma:

- **`apps/api`**: Backend desenvolvido em **NestJS**.
- **`apps/web`**: Frontend desenvolvido em **Next.js 15** (App Router).
- **`packages/`**: Pacotes compartilhados de configurações e tipos (em expansão).

### Fluxo de Autenticação
1. O usuário se autentica via **Supabase Auth** no frontend.
2. O JWT (JSON Web Token) emitido pelo Supabase é enviado no header `Authorization` para a API.
3. A API valida o token usando as chaves públicas (JWKS) do Supabase.
4. Um `Profile` é vinculado ao `supabase_user_id`.

---

## 🔧 Tecnologias Utilizadas

### Backend (`apps/api`)
- **Framework**: NestJS
- **ORM**: TypeORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase JWKS (via Passport/JWT)
- **Linguagem**: TypeScript

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS + Framer Motion (animações)
- **Gerenciamento de Estado/Cache**: TanStack Query (React Query)
- **Componentes**: Radix UI (base para componentes acessíveis)
- **Cliente API**: Axios com interceptores para injeção de token.

---

## 📂 Módulos e Entidades (Backend)

### 1. Perfis (`Profiles`)
Armazena a relação entre o usuário do Supabase e o sistema interno.
- `supabase_user_id`: Chave de ligação com a autenticação.

### 2. Grupos (`Groups`)
O coração da organização do acervo. Tudo no Filmin pertence a um grupo.
- **Solo**: Grupo com apenas um membro.
- **Duo**: Grupo com dois membros (casal/dupla), habilitando notas duplas e Modo Match.
- `invite_code`: Código único para convidar outra pessoa para o grupo.

### 3. Itens de Assistir (`WatchItems`)
Representa um filme ou série.
- **Status**: `Quero Assistir`, `Assistindo`, `Assistido`, `Larguei`.
- **Tipo**: `Filme` ou `Série`.
- **Notas**: Sistema de nota "Dele" e "Dela" para grupos Duo.
- **Relações**: Pertence a um `Group`, possui vários `Generos` e pode ter várias `Temporadas`.

### 4. Temporadas (`Temporadas`)
Rastreamento específico para séries, permitindo marcar o progresso de episódios/temporadas.

---

## 📱 Funcionalidades do Frontend

### 1. Dashboard de Acervo
Visualização central de todos os itens do grupo, com filtros por tipo (Filme/Série) e status.

### 2. Onboarding Dinâmico
Fluxo inicial onde o usuário escolhe se usará o app sozinho ou em dupla. Se em dupla, gera um link de convite único.

### 3. Modo Match (Exclusivo Duo)
Interface estilo "Tinder" onde ambos os membros da dupla votam secretamente nos itens da lista "Quero Assistir". Quando ambos dão "Like", um Match é gerado.

### 4. Gestão de Itens
- Cadastro manual de títulos.
- Edição de notas, status e observações.
- Visualização de pôsteres.

---

## 🔄 Funcionamento do Projeto (Fluxo de Dados)

1. **Proteção de Rotas**: O `GroupGuard` no frontend garante que nenhum usuário acesse o dashboard sem antes estar em um grupo (redirecionando para `/onboarding` se necessário).
2. **Isolamento de Dados**: No backend, todos os queries de busca de itens são filtrados pelo `group_id` do usuário autenticado, garantindo total privacidade entre grupos.
3. **Sincronização**: O uso de React Query garante que alterações feitas por um membro da dupla sejam refletidas para o outro membro através de invalidação de cache e re-fetch.

---

## 🗺️ Roadmap de Evolução

- [ ] **Integração com TMDB API**: Busca automática de metadados e pôsteres de filmes/séries.
- [ ] **Notificações Push**: Avisar quando a dupla adicionar um novo item ou quando houver um Match.
- [ ] **Estatísticas do Casal**: Gráficos de gêneros mais assistidos e concordância de notas.
- [ ] **Filtros Avançados**: Filtrar por gênero, ano e "voto dele/dela" no dashboard.
- [ ] **Importação de Dados**: Importar listas de outros serviços como Letterboxd ou Trakt.

---

## 📂 Resumo da Estrutura de Arquivos e Módulos

Este guia detalha a responsabilidade de cada diretório e arquivo principal do projeto.

### 🏠 Backend (`apps/api/src`)

#### Módulos (`/modules`)
- **`auth/`**: Gerencia a autenticação JWT. Valida os tokens do Supabase usando JWKS (JSON Web Key Sets).
  - `guards/`: Contém o `JwtAuthGuard` que protege as rotas da API.
  - `services/supabase-jwks.service.ts`: Busca e faz cache das chaves públicas do Supabase para validação de tokens.
- **`profiles/`**: Gerencia o perfil interno do usuário vinculado ao UID do Supabase.
- **`groups/`**: Gerencia a criação e adesão a grupos (Solo/Duo).
  - `entities/group-member.entity.ts`: Tabela de ligação entre perfis e grupos, permitindo membros em comum.
- **`watch-items/`**: O módulo principal de conteúdo (Filmes/Séries).
  - `dto/`: Objetos de transferência de dados para criação e filtragem de itens.
- **`generos/`**: Gerencia as categorias (Terror, Comédia, etc.) que podem ser vinculadas aos itens.
- **`temporadas/`**: Gerencia o progresso específico de séries.

#### Banco de Dados (`/database`)
- **`migrations/`**: Histórico de alterações no esquema do banco de dados (TypeORM).
- **`data-source.ts`**: Configuração central de conexão e sincronização do PostgreSQL.

#### Comuns (`/common`)
- **`enums/`**: Definições compartilhadas como `WatchItemStatus` (Quero Assistir, Assistido), `WatchItemTipo` (Filme, Série) e `GroupTipo` (Solo, Duo).

---

### 🎨 Frontend (`apps/web/src`)

#### Aplicação (`/app`) - Next.js App Router
- **`login/`**: Tela de autenticação via Supabase.
- **`onboarding/`**: Fluxo de configuração inicial (escolha entre Solo ou Duo).
- **`convite/[code]/`**: Rota para aceitar convites de grupos Duo.
- **`match/`**: Interface interativa de "Match" para casais.
- **`series/[id]/temporadas/`**: Detalhamento e gestão de episódios de uma série.
- **`providers.tsx`**: Centraliza os contextos (Auth, QueryClient, Theme).

#### Componentes (`/components`)
- **`ui/`**: Componentes de base reutilizáveis (botões, inputs, cards) baseados no Radix UI.
- **`watch-items/`**: Lógica visual específica do acervo:
  - `watch-items-dashboard.tsx`: A visualização principal da lista.
  - `watch-item-card.tsx`: O card individual com pôster e ações rápidas.
  - `create-watch-item-form.tsx`: Formulário para adicionar novos títulos.

#### Biblioteca (`/lib`)
- **`api/`**: Serviços que comunicam com o backend usando Axios.
  - `client.ts`: Configuração do interceptor para injetar o Token JWT em cada requisição.
- **`auth/`**: Contexto de autenticação (`auth-context.tsx`) e o `group-guard.tsx` que protege as rotas.
- **`supabase/`**: Configurações do cliente Supabase para browser e servidor.

#### Tipos (`/types`)
- Definições TypeScript para `WatchItem`, `Genero` e `Temporada`, garantindo consistência de dados em todo o frontend.

