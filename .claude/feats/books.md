# FEAT — Integração com Google Books

## Objetivo

Permitir buscar livros via API do Google Books e usar esses dados no sistema (criação rápida, enriquecimento e autocomplete).

---

## Escopo (MVP)

- Buscar livros por nome
- Exibir resultados no frontend
- Selecionar item → importar dados básicos
- Salvar no banco com `groupId`

---

## Fora do escopo (futuro)

- Sincronização automática
- Cache avançado
- Recomendações
- Multi-idioma dinâmico

---

## Arquitetura

### Regra principal

Nunca chamar Google Books direto do frontend.

### Fluxo

Frontend → Backend → Google Books → Backend trata → Frontend

---

## Backend

### Estrutura

```
apps/api/src/modules/books/
```

### Arquivos

- books.module.ts
- books.service.ts
- books.controller.ts
- books.types.ts
- books.mapper.ts

---

## Responsabilidades

### books.service.ts

- Fazer chamadas HTTP
- Centralizar config (API base URL)
- Tratar erros externos
- Não retornar dado bruto

---

### books.mapper.ts

Responsável por transformar dados externos para o padrão interno.

Exemplo:

Google Books:
```json
{
  "volumeInfo": {
    "title": "Clean Code",
    "authors": ["Robert C. Martin"],
    "imageLinks": {
      "thumbnail": "http://books.google.com/xyz.jpg"
    }
  }
}
```

Interno:
```ts
{
  titulo: "Clean Code",
  autores: ["Robert C. Martin"],
  imagem: "https://books.google.com/xyz.jpg"
}
```

---

### books.controller.ts

Rotas:

- GET /books/search?query=...
- GET /books/:id

---

## Boas práticas backend

- Timeout nas requisições
- Retry simples (1x)
- Sanitizar query
- Limitar resultados (ex: 10)
- Não depender de API key

---

## Frontend

### Uso

- Tela de criação (livro)
- Campo de busca com autocomplete

---

### Fluxo

1. Usuário digita
2. Debounce (300ms)
3. Chama /books/search
4. Lista resultados
5. Usuário seleciona
6. Preenche form automaticamente

---

## Componentização

- BooksSearchInput
- BooksResultItem
- useBooksSearch (hook)

---

## React Query

- queryKey: ["books-search", query]
- enabled: query.length > 2
- staleTime: 5min

---

## Modelagem de dados

### Abordagem recomendada

Salvar dados próprios + referência externa:

```ts
{
  titulo: string
  autores: string[]
  descricao?: string
  imagem?: string
  googleBooksId?: string
}
```

---

## Tratamento de dados (IMPORTANTE)

Google Books é inconsistente.

Sempre tratar:

- Livro sem imagem
- Livro sem descrição
- authors undefined
- thumbnail em http → converter para https

---

## Rate Limit

Mitigação:

- Debounce no frontend
- Limite de resultados no backend
- Cache (futuro)

---

## Segurança

- Não expor chamadas externas no frontend
- Validar input
- Sanitizar query

---

## Tratamento de erros

- Timeout
- Resultado vazio
- API fora

Sempre retornar fallback amigável.

---

## Evoluções futuras

- Cache Redis
- Fallback com Open Library
- Recomendações
- Importação de mais metadados (ISBN, páginas, editora)

---

## Riscos

- Dados inconsistentes
- Falta de imagem
- Falta de descrição

---

## Decisão estratégica

- Google Books é fonte externa
- Mapper é obrigatório
- Backend intermediário obrigatório
- Dados devem ser persistidos localmente
