# 📊 Feature: Retrospectiva (Estilo Spotify Wrapped)

## 🎯 Objetivo

Criar uma experiência altamente visual e compartilhável que aumente engajamento, retenção e recorrência dentro do PWA, utilizando dados já existentes de consumo para gerar valor percebido.

---

## 🧠 Estratégia de Produto

Essa feature não é só "legal" — ela tem três objetivos claros:

1. **Reforço de hábito** → usuário volta para ver evolução
2. **Viralização orgânica** → compartilhamento do resumo
3. **Gamificação leve** → comparação entre usuários (modo Duo)

Se não for compartilhável e visualmente impactante, falha no core.

---

## 🧩 Escopo Funcional

### 📅 Períodos suportados

* Mês atual
* Últimos 3 meses
* Ano atual
* Todo período

### 📈 Métricas

* Total consumido (filmes, séries, livros)
* Gênero favorito
* Média de notas (comparativo no Duo)
* Maior e menor nota
* Item destaque (melhor avaliado)
* Tempo estimado de tela
* Maior streak

---

## ⚙️ Backend

### 🔌 Endpoint

`GET /stats/retrospective?period=month|quarter|year|all`

### 📦 Response (exemplo)

```json
{
  "totalItems": 42,
  "genres": {
    "top": "Drama",
    "distribution": []
  },
  "ratings": {
    "userA": 4.2,
    "userB": 3.8
  },
  "highlights": {
    "best": {...},
    "worst": {...}
  },
  "screenTime": 84,
  "streak": 6
}
```

### 🧮 Regras de cálculo

* **Tempo de tela:**

  * Filme → 2h fixo
  * Série → 10h média (ou usar episódios se tiver)

* **Streak:**

  * Ordenar por `dataAssistida`
  * Detectar dias consecutivos

* **Gênero favorito:**

  * GROUP BY gênero
  * ORDER BY COUNT DESC

### ⚠️ Pontos de atenção

* Performance → queries agregadas pesadas

  * Solução: cache por período (Redis ou materialized view)
* Consistência → dados incompletos quebram narrativa

---

## 🖥️ Frontend (PWA)

### 🧭 Rota

`/retrospectiva`

### 🧱 Componentes

* `RetrospectiveSlides`
* `StatCounter`
* `PosterReveal`
* `ComparisonBar`

### 🎞️ Experiência

Fluxo tipo story:

1. Intro ("Seu mês em números")
2. Total consumido
3. Gênero favorito
4. Comparação de notas
5. Melhor e pior item
6. Tempo de tela
7. Streak
8. Destaque final
9. Card compartilhável

### 🎯 Interações

* Swipe (mobile first)
* Click (desktop fallback)
* Animações com Framer Motion

---

## 📱 Considerações de PWA

* Deve funcionar offline com último snapshot salvo
* Lazy load dos dados + skeleton inicial
* Evitar bundle pesado (split por rota)

---

## 🚀 Plano de Execução

### Fase 1 — Backend

* Criar endpoint
* Validar queries
* Testar performance

### Fase 2 — UI Base

* Criar estrutura de slides
* Navegação funcional

### Fase 3 — Animações

* Counters
* Transições
* Reveal de conteúdo

### Fase 4 — Modo Duo

* Comparações
* Ajustes visuais

### Fase 5 — Compartilhamento

* Gerar card
* Export (imagem)

---

## 📊 Métricas de Sucesso

* % usuários que acessam retrospectiva
* % que compartilham
* Tempo médio na feature
* Retenção após visualização

---

## ⚠️ Riscos

* Dados insuficientes → experiência fraca
* Performance ruim → quebra imersão
* UI pouco impactante → baixa retenção

---

## 💡 Evoluções Futuras

* Ranking entre amigos
* Badges ("cinéfilo hardcore")
* Insights mais profundos (ex: "você gosta de finais tristes")

---

## 🧠 Opinião direta

Se você fizer isso "meia boca", vira só mais uma tela de stats que ninguém usa.

O diferencial aqui é:

* narrativa
* animação
* compartilhamento

Prioriza isso acima de perfeição nos dados.
