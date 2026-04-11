# 🧠 Mapa Mental do Sistema Filmin

Este documento serve como um guia arquitetural e funcional do projeto **Filmin**.

---

## 🏗️ Arquitetura Técnica

### 📂 Estrutura do Projeto (Monorepo)
- **`apps/api`**: Backend construído com **NestJS**.
  - **ORM**: TypeORM com PostgreSQL.
  - **Auth**: Integração com Supabase (validação via JWKS).
  - **Docs**: Swagger UI disponível para exploração de endpoints.
- **`apps/web`**: Frontend construído com **Next.js (App Router)**.
  - **Estilização**: Tailwind CSS 4.
  - **Animações**: Framer Motion (altamente interativo).
  - **State/Data**: TanStack React Query para cache e sincronização.
  - **Auth**: Supabase SSR e Client.

---

## 🎭 Funcionalidades (Features)

### 📊 Dashboard e Gestão de Conteúdo
- **Tipos de Mídia**: Filmes, Séries e Livros.
- **Estados de Visualização**:
  - `Quero Assistir`: Wishlist.
  - `Assistindo`: Progresso atual.
  - `Assistido`: Histórico com avaliações.
  - `Abandonado`: Itens deixados de lado.
- **Avaliações**:
  - Notas individuais (`Nota Dele` / `Nota Dela`) para casais.
  - Nota geral do item.
- **Séries**: Gestão de temporadas vinculadas ao item principal.

### 👥 Colaboração (Grupos)
- **Modo Solo**: Uso individual.
- **Modo Duo**: Compartilhamento em tempo real entre dois perfis.
- **Convites**: Sistema de código de convite para vincular perfis em um grupo.

### 🕹️ Experiência Gamificada
- **Modo Match (Exclusivo Duo)**:
  - Votação secreta simultânea ("Gostei" / "Não Gostei").
  - Identificação de "Matches" (onde ambos querem assistir).
  - **Sorteio Animado**: Se houver muitos matches, um sorteio com animação de "spin" decide o título.
- **Escolha Rápida (Exclusivo Solo)**:
  - Seleção aleatória de itens da lista "Quero Assistir".
  - **Interação Mobile**: Suporte a sensor de movimento (sacudir o celular para sortear).
  - **Interação Desktop**: Botão de "Segurar para Sortear".

---

## 💾 Modelo de Dados (Entidades)

- **`Profile`**: Informações do usuário (nome, gênero, vínculo com Supabase).
- **`Group`**: Unidade lógica que detém os itens (`Solo` ou `Duo`). Possui um `invite_code`.
- **`GroupMember`**: Tabela de ligação entre Perfis e Grupos.
- **`WatchItem`**: O conteúdo em si (título, poster, tipo, status, notas).
- **`Temporada`**: Detalhamento de séries.
- **`Genero`**: Categorização (Ação, Drama, etc.).

---

## 🚀 Fluxos de Usuário

1.  **Onboarding**: Login via Supabase -> Criação de Perfil -> Escolha entre criar grupo ou entrar via convite.
2.  **Alimentação**: Adição de filmes/séries/livros à lista "Quero Assistir".
3.  **Decisão**: 
    - Se sozinho: Usa **Escolha Rápida**.
    - Se em dupla: Usa **Modo Match** para filtrar interesses mútuos.
4.  **Consumo**: Marca item como "Assistindo" e, ao finalizar, move para "Assistido" atribuindo as notas.

---

## 🛠️ Tecnologias Chave
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport JWT, Swagger.
- **Frontend**: Next.js 15+, Tailwind 4, Framer Motion, Lucide React, React Query.
- **Infra**: Supabase (Auth/DB Hosting).
