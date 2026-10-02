# Auth Resume — Filmin

Documento de referência sobre autenticação, permissões, usuários e grupos no sistema Filmin.

---

## Visão Geral

A autenticação do Filmin é baseada em **Supabase Auth** com validação de JWT no backend via **JWKS** (JSON Web Key Set). O backend NestJS nunca armazena senhas — toda identidade vem do token Supabase.

---

## Fluxo de Autenticação

```
Usuário faz login (Supabase)
        ↓
Recebe JWT do Supabase
        ↓
Frontend envia token no header: Authorization: Bearer <token>
        ↓
JwtAuthGuard (NestJS) intercepta toda requisição
        ↓
SupabaseJwksService.verify(token) — valida assinatura via JWKS
        ↓
AuthService.findOrCreateProfile() — cria Profile se não existir
        ↓
request.user = AuthenticatedUser { profileId, groupId, ... }
        ↓
Controller acessa via @CurrentUser() decorator
```

---

## Entidades de Identidade

### Supabase User
- Gerenciado 100% pelo Supabase (email, senha, OAuth)
- Identificado por `supabase_user_id` (UUID)
- Não é armazenado no banco do Filmin — apenas referenciado

### Profile (entidade interna)
- Criado automaticamente no **primeiro login bem-sucedido**
- Campos: `id`, `supabase_user_id`, `email`, `first_name`, `last_name`, `genero`, `is_private`
- `supabase_user_id` é único — garante 1 Profile por usuário Supabase
- Criação concorrente tratada: em caso de race condition (erro `23505`), reusa o profile existente

---

## AuthenticatedUser (request.user)

Objeto injetado em toda requisição autenticada:

```typescript
interface AuthenticatedUser {
  supabaseUserId: string;   // ID do Supabase
  email: string;
  profileId: string;        // ID interno do Profile (usar sempre este)
  groupId: string | null;   // Grupo ativo (Duo > Solo)
  groupTipo: GroupTipo | null; // 'SOLO' | 'DUO' | null
  soloGroupId: string | null;  // Grupo solo pessoal do usuário
  genero: GeneroUsuario | null; // 'masculino' | 'feminino' | 'outro'
}
```

> ⚠️ **Sempre usar `profileId` como identificador interno** — nunca `supabaseUserId` para queries de negócio.

---

## JwtAuthGuard

**Arquivo**: `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

- Guard **global** aplicado a todas as rotas automaticamente
- Valida o token via `SupabaseJwksService`
- Cria ou recupera o `Profile` do usuário
- Popula `request.user` com `AuthenticatedUser`
- Rotas públicas escapam via decorator `@Public()`

### Rotas públicas
Usar o decorator `@Public()` para rotas que não exigem autenticação:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Get('health')
healthCheck() { ... }
```

---

## SupabaseJwksService

**Arquivo**: `apps/api/src/modules/auth/services/supabase-jwks.service.ts`

- Busca as chaves públicas do Supabase via JWKS endpoint
- Valida assinatura, expiração e issuer do JWT
- Cache das chaves para evitar requisições repetidas

---

## AuthService

**Arquivo**: `apps/api/src/modules/auth/auth.service.ts`

Métodos principais:

| Método | Descrição |
|--------|-----------|
| `findOrCreateProfile(supabaseUserId, email, metadata)` | Cria Profile no primeiro login |
| `getProfileGroups(profileId)` | Retorna groupId ativo (Duo > Solo) + soloGroupId |
| `getMe(profileId)` | Retorna Profile + grupos para endpoint `/auth/me` |

---

## Sistema de Grupos e Permissões

### Hierarquia de Grupos
- **Solo**: 1 membro, criado no onboarding, persiste para sempre
- **Duo**: 2 membros, criado voluntariamente, pode ser dissolvido
- **Prioridade**: Duo sempre prevalece sobre Solo ao retornar `groupId`

### Estados possíveis de um usuário

| Estado | groupId | groupTipo | soloGroupId |
|--------|---------|-----------|-------------|
| Sem grupo (pré-onboarding) | `null` | `null` | `null` |
| Apenas Solo | `<solo_id>` | `SOLO` | `<solo_id>` |
| Solo + Duo | `<duo_id>` | `DUO` | `<solo_id>` |

### GroupGuard (Frontend)
**Arquivo**: `apps/web/src/lib/auth/group-guard.tsx`

- Bloqueia acesso ao sistema se `groupId === null`
- Redireciona para `/onboarding`
- Aplicado em todas as rotas protegidas

---

## Fluxo de Onboarding

```
Usuário novo faz login
        ↓
JwtAuthGuard cria Profile automaticamente
        ↓
groupId === null → GroupGuard redireciona para /onboarding
        ↓
Usuário escolhe:
  ├─ "Usar sozinho" → POST /groups/solo → cria grupo Solo
  └─ "Tenho um convite" → POST /groups/join/:code → entra em Duo
             ↓ (join também cria Solo internamente)
        ↓
groupId !== null → acesso liberado ao app
```

---

## Fluxo de Gestão do Duo

### Criar Duo
```
POST /groups/duo
→ Garante que usuário tem Solo (cria se não tiver)
→ Cria grupo Duo com invite_code
→ Retorna groupId (duo) + soloGroupId
```

### Entrar em Duo via Convite
```
POST /groups/join/:inviteCode
→ Valida código (case-insensitive)
→ Garante que usuário tem Solo
→ Verifica: grupo existe, é Duo, tem < 2 membros, usuário não está em outro Duo
→ Adiciona membro ao grupo
→ Emite evento SSE 'member_joined' para os membros existentes
→ Retorna groupId (duo) + soloGroupId
```

### Sair do Duo (leaveDuo)
```
DELETE /groups/duo
→ Carrega todos os WatchItems do Duo (com gêneros e temporadas)
→ Garante que o outro membro tem grupo Solo
→ Transação atômica:
   1. Clona todos os itens para o Solo de quem sai
   2. Clona todos os itens para o Solo do outro membro
   3. Remove relações M:N de gêneros dos itens do Duo
   4. Deleta WatchItems do Duo
   5. Remove GroupMembers
   6. Deleta o grupo Duo
→ Emite evento SSE 'duo_dissolved' para o membro que ficou
```

> ⚠️ **Se a transação falhar, nenhuma alteração é aplicada** (tudo ou nada).

---

## Isolamento de Dados

- **Toda query de WatchItem** deve filtrar por `groupId` do usuário autenticado
- **Nunca** acessar dados de outro grupo sem validação explícita
- O backend valida que o `groupId` da requisição pertence ao usuário via `request.user`
- Perfis privados (`is_private: true`) ocultam dados para visitantes não autorizados

---

## Decorators Disponíveis

### @CurrentUser()
Injeta o `AuthenticatedUser` no parâmetro do controller:

```typescript
@Get('me')
async getMe(@CurrentUser() user: AuthenticatedUser) {
  return this.service.getData(user.profileId, user.groupId);
}
```

### @Public()
Marca uma rota como pública (bypass do JwtAuthGuard):

```typescript
@Public()
@Get('health')
healthCheck() { return { ok: true }; }
```

---

## Enums de Auth/Usuário

```typescript
// Gênero do usuário
enum GeneroUsuario {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  OUTRO = 'outro',
}

// Tipo de grupo
enum GroupTipo {
  SOLO = 'SOLO',
  DUO = 'DUO',
}
```

---

## Frontend — Contexto de Auth

**Arquivo**: `apps/web/src/lib/auth/auth-context.tsx`

- Provê `user` (Supabase session) e `profile` (dados internos)
- Expõe `groupId`, `groupTipo`, `soloGroupId`
- Usado via hook `useAuth()` em qualquer componente

### Supabase Client (Frontend)
- **Client-side**: `apps/web/src/lib/supabase/client.ts`
- **Server-side (SSR)**: `apps/web/src/lib/supabase/server.ts`
- **Middleware**: `apps/web/src/middleware.ts` — intercepta rotas e valida sessão

### Callback de Auth
**Rota**: `/auth/callback`
- Processa o redirect do Supabase após login OAuth ou magic link
- Troca o `code` por sessão válida

---

## Segurança

- JWT validado via assinatura criptográfica (RS256) — impossível falsificar
- Tokens nunca armazenados no backend
- `supabaseUserId` usado apenas para lookup de `Profile` — não vaza para lógica de negócio
- Inputs validados com class-validator nos DTOs
- Queries filtradas por `groupId` do token — não é possível acessar dados de outro grupo
- Perfis privados protegidos no service de Profiles
- Streak: timestamps validados no backend (nunca no cliente)
- TMDB API KEY e variáveis sensíveis apenas no `.env` do backend
