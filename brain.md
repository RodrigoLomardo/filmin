# Filmin — Contexto do Projeto

## Visão Geral

PWA para gerenciamento de filmes, séries e livros com foco em uso pessoal ou em dupla (Duo).

Objetivo principal:
- Resolver “o que assistir/ler”
- Criar interação entre usuários no modo Duo
- Gamificar a experiência de consumo de mídia
- Manter simplicidade com arquitetura escalável

---

## Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind + Framer Motion
- TanStack Query
- Axios (centralizado em `lib/api`)
- Lucide React (ícones)

### Backend
- NestJS
- TypeORM
- PostgreSQL (Supabase)
- Groq SDK (IA)
- RxJS (Notificações SSE)

### Infra
- Monorepo (`apps/api`, `apps/web`)
- Deploy: Vercel (web) + Render (api)

---

## Domínio

### Profiles
- Ligação com usuário do Supabase (`supabase_user_id`)
- Campos de perfil: nome, bio, gênero, avatar
- Privacidade: Opção de perfil público ou privado
- Social: Rastreamento de visitantes ("Stalkers")

### Groups
- Unidade central do sistema
- Tipos:
  - Solo (1 usuário)
  - Duo (2 usuários)
- Possui `invite_code` para entrada de parceiro

### WatchItems (Itens de Consumo)
- Representa filme, série ou livro
- Campos principais:
  - status: `quero_assistir`, `assistindo`, `assistido`, `abandonado`
  - tipo: `filme` | `serie` | `livro`
- Relacionamentos:
  - pertence a `Group`
  - possui `Generos`
  - possui `Temporadas` (para séries)
- No modo Duo:
  - Possui avaliação independente por ambos os membros (Sincronização Duo)

### Temporadas
- Controle de progresso detalhado para séries

---

## Funcionalidades principais

### Core
- **Dashboard**: Filtros por status/tipo e visualização do progresso.
- **Cadastro e Edição**: Gerenciamento manual ou via integrações.
- **Onboarding**: Fluxo para novos usuários (Solo ou Duo).
- **Modo Match**: Decisão em dupla estilo swipe (Tinder de filmes).
- **Escolha Rápida**: Interface tátil (estilo slot machine) para sorteio de títulos quando a dúvida persiste.
- **Busca Unificada**: Pesquisa integrada em múltiplas fontes (TMDB e Google Books).

### Gamificação e Social
- **Achievements (Conquistas)**: Sistema de medalhas baseadas em marcos de consumo (ex: Cinéfilo, Maratonista, Leitor Ávido).
- **Streak**: Rastreamento de atividade contínua (diária/semanal).
- **Perfil Social**: Visualização de perfis de outros usuários, controle de privacidade e lista de visitantes recentes.

### Inteligência e Dados
- **Theo (Assistente IA)**: IA baseada em Groq que oferece recomendações personalizadas com base no histórico do grupo e memória de conversas anteriores.
- **Estatísticas / Retrospectiva**: Análise detalhada de consumo por período (Melhor/pior nota, gêneros favoritos, tempo de tela estimado).
- **Notificações em Tempo Real**: Sistema via SSE para eventos do sistema (convites, atualizações do parceiro).

---

## Integrações Externas

- **TMDB (The Movie Database)**: Catálogo completo de filmes e séries, incluindo metadados e posters.
- **Google Books**: Catálogo de livros e informações editoriais.
- **Groq**: Motor de LLM para o assistente Theo.

---

## Regras de funcionamento

- Todo dado de consumo é isolado por `group_id`.
- Usuário não acessa sistema sem estar em grupo (`GroupGuard`).
- Sincronização Duo: Notas e status podem ser sincronizados ou mantidos individuais até que ambos avaliem.

---

## Estrutura do Projeto

### Backend (`apps/api`)
- `achievements`: Lógica de conquista e níveis.
- `auth`: Validação JWT e integração Supabase.
- `books`: Integração com Google Books.
- `groups` & `profiles`: Gestão de usuários e grupos.
- `notifications`: Engine de SSE.
- `stats`: Agregação de dados para retrospectiva.
- `streak`: Lógica de gamificação por atividade.
- `theo`: Módulo de IA (Groq + Memória + Recomendações).
- `tmdb`: Integração com API de filmes/séries.
- `watch-items`: CRUD central de mídia.

### Frontend (`apps/web`)
- `/app`: Rotas principais (theo, match, retrospectiva, conquistas, etc).
- `/components`: Componentes modulares de UI e lógica de domínio.
- `/lib/api`: SDK de comunicação com o backend NestJS.
- `/types`: Definições de contratos e interfaces.

---

## Princípios

- Simplicidade > Complexidade.
- Foco em experiência tátil e visual (uso de Framer Motion).
- Arquitetura pronta para novos tipos de mídia.
- Prioridade para o modo Duo.