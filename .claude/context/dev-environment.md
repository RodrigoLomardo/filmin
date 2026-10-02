# Ambiente de Desenvolvimento — Filmin

Referência de como rodar o Filmin localmente contra um banco e um Auth próprios,
sem qualquer risco para produção.

---

## Arquitetura do ambiente local

```
apps/web (localhost:3000) ──── Supabase Auth LOCAL (127.0.0.1:54321) ───┐
      │                             JWT ES256 + JWKS                     │
      └── HTTP ──> apps/api (localhost:3001) ── TypeORM ──> Postgres LOCAL (127.0.0.1:54322)
                        │                                                 │
                        └── JWKS ─────────────────────────────────────────┘
```

Tudo roda em Docker via Supabase CLI. **Nenhuma máquina de desenvolvimento aponta
para produção** — as credenciais de prod existem apenas nos painéis do Render e da Vercel.

Produção e dev são projetos independentes: o `supabase_user_id` do `Profile` não tem
FK para `auth.users`, e o schema é reproduzido inteiramente pelas migrations do TypeORM.

---

## Subir o ambiente

```bash
npm run db:start      # sobe Postgres + Auth + Studio (Docker)
npm run db:migrate    # aplica as migrations do TypeORM
npm run db:seed       # cria usuários de teste no Auth + dados de domínio
npm run dev           # api (3001) + web (3000)
```

A API loga no boot o ambiente e o banco em uso — sempre confira esse banner:

```
[Bootstrap] Ambiente: development
[Bootstrap] Banco: 127.0.0.1:54322/postgres
[Bootstrap] Supabase: http://127.0.0.1:54321
```

Também disponível em `GET /health` (rota pública).

### Scripts

| Comando | O que faz |
|---|---|
| `npm run db:start` | Sobe a stack local |
| `npm run db:stop` | Derruba a stack (dados persistem no volume) |
| `npm run db:status` | Mostra URLs e chaves locais |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:seed` | Recria os dados de teste (trunca o domínio antes) |
| `npm run db:reset` | Banco do zero: reset + migrations + seed |
| `npm run db:check` | Valida que as migrations rodam em banco limpo (usar antes de PR) |

Supabase Studio para inspecionar dados: http://127.0.0.1:54323
Caixa de e-mails local (confirmações, reset de senha): http://127.0.0.1:54324

---

## Usuários de teste

Senha de todos: `filmin123`

| E-mail | Cenário que exercita |
|---|---|
| `dev.pai@filmin.local` | Duo completo com acervo rico, streak 35, 3 conquistas, memória do Theo |
| `dev.mae@filmin.local` | Mesmo Duo; tem 1 nota pendente (`Duna: Parte Dois`) para sincronização |
| `dev.solo@filmin.local` | Solo com 23 itens espalhados em 12 meses — retrospectiva em todos os períodos |
| `dev.privado@filmin.local` | Perfil privado com 2 visitantes (Stalkers), streak 65 |
| `dev.novato@filmin.local` | Sem grupo — valida onboarding e `GroupGuard` |
| `dev.convite@filmin.local` | Duo aberto aguardando parceiro |

Códigos de convite: `DEVDUO01` (duo cheio) e `DEVJOIN1` (duo com 1 vaga, use para
testar o fluxo de entrada).

O Modo Família do Theo está apontado para `dev.pai` e `dev.mae` via
`FAMILY_EMAIL_PAI` / `FAMILY_EMAIL_MAE`.

---

## Variáveis de ambiente

`apps/api/.env`:

| Variável | Valor em dev |
|---|---|
| `APP_ENV` | `development` — fonte da verdade para guardrails, CORS e logs |
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| `DATABASE_SSL` | `false` (Supabase hospedado exige `true`) |
| `SUPABASE_URL` | `http://127.0.0.1:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave local; usada só pelo seed para criar usuários |

`apps/web/.env` usa a `ANON_KEY` local (obtida com `npm run db:status`).

As chaves de TMDB, Groq e Google Books são compartilhadas com produção. Atenção à
quota do Groq ao testar o Theo — a memória de conversa já vem semeada justamente
para reduzir chamadas ao LLM.

---

## Guardrails

Scripts destrutivos (`db:seed`, `db:reset`) abortam se:

- `APP_ENV` não for `development`; ou
- `DATABASE_URL` não apontar para um host local.

Implementado em `assertSafeToMutate` (`src/common/config/environment.ts`) e repetido
dentro de `truncateDomainTables`, para a função ser segura em qualquer chamada.

---

## Fluxo de migrations

1. Criar a migration e aplicá-la localmente (`npm run db:migrate`).
2. Rodar `npm run db:check` para garantir que a sequência funciona em banco limpo.
3. Abrir PR para `develop`.
4. Aplicar em produção como passo explícito e deliberado, nunca automático.

> O `data-source.ts` precisa listar **todas** as entidades. Com a lista incompleta,
> um `migration:generate` gera `DROP TABLE` para as entidades ausentes.

---

## Limitação conhecida: não há ambiente de dev remoto

Previews da Vercel não alcançam `localhost`, então **continuam apontando para a API e
o banco de produção**. Consequências práticas:

- Teste funcional de feature acontece **somente local**.
- Preview serve para revisão visual; evite criar ou editar dados por ele.

Se no futuro houver espaço no Supabase (hoje a cota de 2 projetos free está ocupada),
vale criar um projeto `filmin-dev` em organização Free separada e um serviço
`filmin-api-dev` no Render com auto-deploy em `develop`.
