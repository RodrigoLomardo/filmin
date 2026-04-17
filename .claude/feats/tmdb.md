# FEAT — Integração com TMDB

## Objetivo

Permitir buscar filmes/séries via API do TMDB e usar esses dados no sistema (criação rápida, enriquecimento e autocomplete).

---

## Escopo (MVP)

- Buscar filmes/séries por nome
- Exibir resultados no frontend
- Selecionar item → importar dados básicos
- Salvar no banco com `groupId`

---

## Fora do escopo (futuro)

- Sincronização automática
- Cache avançado
- Recomendações baseadas em TMDB
- Multi-idioma dinâmico

---

## Arquitetura

### Regra principal

Nunca chamar TMDB direto do frontend.

### Fluxo

Frontend → Backend → TMDB → Backend trata → Frontend

---

## Backend

### Estrutura

```
apps/api/src/modules/tmdb/
```

### Arquivos

- tmdb.module.ts
- tmdb.service.ts
- tmdb.controller.ts
- tmdb.types.ts
- tmdb.mapper.ts

---

## Responsabilidades

### tmdb.service.ts

- Fazer chamadas HTTP
- Centralizar API KEY
- Tratar erros externos
- Não retornar dado bruto

---

### tmdb.mapper.ts

Responsável por transformar dados externos para o padrão interno.

Exemplo:

TMDB:
```json
{
  "title": "Inception",
  "poster_path": "/abc.jpg"
}
```

Interno:
```ts
{
  titulo: "Inception",
  imagemUrl: "https://image.tmdb.org/t/p/w500/abc.jpg"
}
```

---

### tmdb.controller.ts

Rotas:

- GET /tmdb/search?query=...
- GET /tmdb/:id

---

## Boas práticas backend

- Timeout nas requisições
- Retry simples (1x)
- Sanitizar query
- Limitar resultados (ex: 10)
- API KEY no .env

---

## Frontend

### Uso

- Tela de criação (filme/série)
- Campo de busca com autocomplete

---

### Fluxo

1. Usuário digita
2. Debounce (300ms)
3. Chama /tmdb/search
4. Lista resultados
5. Usuário seleciona
6. Preenche form automaticamente

---

## Componentização

- TmdbSearchInput
- TmdbResultItem
- useTmdbSearch (hook)

---

## React Query

- queryKey: ["tmdb-search", query]
- enabled: query.length > 2
- staleTime: 5min

---

## Modelagem de dados

### Abordagem recomendada

Salvar dados próprios + referência do TMDB:

```ts
{
  titulo: string
  descricao: string
  imagem: string
  tmdbId?: number
}
```

---

## Imagens

Formato:

```
https://image.tmdb.org/t/p/w500/{poster_path}
```

---

## Rate Limit

Mitigação:

- Debounce no frontend
- Limite de resultados no backend
- Cache (futuro)

---

## Segurança

- API KEY apenas no backend
- Nunca expor no frontend
- Validar input

---

## Tratamento de erros

- Timeout
- Resultado vazio
- Falha na API

Sempre retornar fallback amigável.

---

## Evoluções futuras

- Cache Redis
- Sync periódica
- Importação de elenco
- Recomendações

---

## Riscos

- Acoplamento com TMDB
- Rate limit
- Dados inconsistentes

---

## Decisão estratégica

- TMDB é fonte externa
- Mapper é obrigatório
- Backend intermediário obrigatório
- Dados devem ser persistidos localmente
