# FEAT — Sistema de Foguinho (Streak)

## Objetivo

Implementar um sistema de **streak** (foguinho) semelhante ao do TikTok, com o objetivo de incentivar a consistência no uso do aplicativo através de registros contínuos de atividade (watch items e notas).

---

## Escopo (MVP)

- Criar sistema de streak por usuário/grupo
- Definir tipo de foguinho (diário, fim de semana, mensal, etc.)
- Incrementar streak ao registrar:
  - Novo watch item
  - Nova nota em watch item
- Reset automático ao quebrar a regra
- Permitir alteração do tipo de foguinho (com reset obrigatório)
- Exibir foguinho com animação no frontend
- Alterar cor do foguinho baseado na progressão

### Fora do escopo (futuro)

- Notificações push ("quase perdeu o streak")
- Ranking entre usuários
- Conquistas/badges
- Compartilhamento social

---

## Regras de Negócio (CRÍTICO)

- O foguinho é **isolado por `groupId`**
- Cada grupo/usuário possui **apenas um tipo de streak ativo**
- Alterar o tipo de streak → **reset obrigatório**
- O streak só é mantido se a regra for cumprida dentro do período definido

### Tipos de Foguinho

| Tipo       | Regra                                                                 |
|------------|-----------------------------------------------------------------------|
| **Diário** | Pelo menos 1 atividade por dia                                        |
| **Fim de semana** | Pelo menos 1 atividade entre sexta, sábado ou domingo             |
| **Mensal** | Pelo menos 1 atividade por mês                                        |

### Eventos que contam para o streak

- Criação de watch item
- Adição de nota em watch item

> **Independente do tipo de mídia**

---

## Arquitetura

### Fluxo

### Backend

**Pasta:**
`apps/api/src/modules/streak/`

**Arquivos:**
- `streak.module.ts`
- `streak.service.ts`
- `streak.controller.ts`
- `streak.entity.ts`
- `streak.types.ts`
- `streak.utils.ts`

#### Modelagem de Dados

```ts
{
  id: string;
  groupId: string;

  tipo: 'daily' | 'weekend' | 'monthly';

  sequenciaAtual: number;
  maiorSequencia: number;

  ultimoRegistroEm: Date;
  periodoAtualValido: boolean;

  criadoEm: Date;
  atualizadoEm: Date;
}

## Lógica de Funcionamento

Ao registrar uma atividade:

1. Buscar streak do `groupId`
2. Validar se a atividade está dentro do período atual
   - **Se sim** → manter streak
   - **Se não** → verificar próximo período válido:
     - Sim → incrementar streak
     - Não → resetar streak para 1

### Regras por tipo

| Tipo | Validação |
|------|-----------|
| Diário | Comparar por dia (`YYYY-MM-DD`) |
| Fim de semana | Verificar se data está entre sexta e domingo |
| Mensal | Comparar mês/ano |

---

## Boas Práticas (Backend)

- Sempre validar `groupId`
- Nunca confiar em data enviada pelo client
- Usar timezone consistente (UTC)
- Centralizar toda lógica em `streak.utils.ts`
- Evitar duplicação de código

---

## Frontend

### Onde será usado

- Dashboard principal
- Header do app
- Tela de perfil

### Componentes

- `StreakDisplay`
- `StreakFire`
- `StreakSelector`
- `useStreak` (hook)

### Tecnologias

- **Framer Motion** (animações)
- **SVG animado** ou **Lottie**
- **React Query**
  - `queryKey: ["streak", groupId]`
  - Invalidate ao registrar atividade

### Performance

- Atualização otimista no frontend
- Cálculo principal no backend
- Evitar refetch desnecessário

---

## UI/UX (CRÍTICO)

### Direção Visual

- Minimalista
- Brilhante
- Fluido
- Feedback imediato

### Animações

- Fogo animado contínuo (loop suave)
- Escala leve (pulse)
- Glow dinâmico
- Transição suave de cor

### Sistema de Cores (Progressão)

| Sequência | Cor | Emoji |
|-----------|-----|-------|
| 0–9 | Laranja | 🔥 |
| 10–29 | Amarelo | 🔥 |
| 30–59 | Azul | 🔥 |
| 60+ | Roxo | 🔥 |

> Pode ser ajustado facilmente via tema.

---

## Segurança

- Nunca confiar no timestamp do frontend
- Toda validação deve ocorrer no backend
- Sempre filtrar por `groupId`
- Impedir manipulação manual do streak

---

## Tratamento de Erros

- Streak inexistente → criar automaticamente
- Falha de cálculo → fallback seguro
- Dados inconsistentes → reset controlado

---

## Riscos

- Lógica de tempo mal implementada
- Problemas com timezone
- Edge cases (fim de mês, domingo → segunda, etc.)

---

## Decisão Estratégica

- Streak é regra de negócio central → **Backend controla tudo**
- Frontend apenas exibe e anima
- Lógica isolada e reutilizável
- Sistema extensível para novos tipos de streak
