# Plano de Execução do Desenvolvimento

**Projeto:** Filmin  
**Versão:** 1.0 – Março 2026  
**Autor:** Rodrigo Lomardo  

## 1. Visão Geral e Ideia Central

Um aplicativo web progressivo (PWA) pessoal, bonito, dinâmico, animado, atual, moderno e viciante para registrar, organizar filmes e series.  

O app funciona exatamente como um aplicativo nativo: pode ser instalado na tela inicial do celular e do computador. O usuário adiciona filmes/serie que assistiu ou quer assistir, visualiza estatísticas visuais. 

Tudo é sincronizado em tempo real na nuvem, com custo zero enquanto for uso pessoal, e com dados 100% sob controle do usuário.

o App funcionara em MonoRepo, apenas um repositorio no github

**Foco principal:**  
Simplicidade hoje + arquitetura preparada para escalar amanhã ( mais dados, novas funcionalidades como séries).

## 2. Objetivos do Projeto

- Criar uma ferramenta útil e prazerosa para uso diário pessoal.
- Garantir experiência offline-first e instalação como app nativo.
- Manter custo zero enquanto o app for pessoal.
- Projetar a arquitetura com boas práticas desde o início para que, no futuro, seja fácil adicionar autenticação (a principio nao teremos nenhum tipo), múltiplos usuários, notificações push avançadas.

## 3. Tecnologias Principais e Mais Úteis

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + TanStack Query (cache e sincronização automática).
- **PWA:** Next-PWA (manifest, service worker e instalação nativa).
- **Backend:** Node + NestJS + TypeScript + TypeORM
- **Banco de Dados:** PostgreSQL hospedado no Supabase (gratuito, com backups automáticos, autenticação futura e Edge Functions).
- **Deploy:** Vercel (frontend – otimizado para Next.js) + Render (backend – gratuito e confiável).

Essas escolhas garantem alta performance (renderização no servidor + cache inteligente), facilidade de manutenção e caminho natural para crescimento sem refatoração pesada.

Vamos seguir os padroes de boas praticas das tecnologias utilizadas e montar a arquitetura padrao de ambas para melhor organizacao e performace.

## 4. Features que Estarão Certamente no Projeto

### Core (obrigatórias)
- Cadastro completo de filmes/serie (título, ano, nota, data assistida, gênero, tipo (filme ou serie)).
- Sistema de status: Já Assisti / Quero Assistir / Rewatch.
- Visualização em lista/tabelas customizadas que criaremos.
- Animacoes modernas e inovadoras na interface.

### Dinâmicas e Criativas
- Watchlist separada com abas claras (“Já Assisti” e “Quero Assistir”).
- Página de Estatísticas Visuais Automáticas (gráficos de filmes/series por mês/ano, média por gênero,).


### Qualidade e Experiência
- Modo escuro automático.
- Design 100% responsivo e otimizado para mobile.
- Notificações push básicas via PWA (futuramente expandível).
- Wrapped anual automático (disponível em dezembro).


## 4. Identidade Visual

- palheta de cores sera focada no rosa (neon) e preto tendo um tom moderno e elegante.
- animacoes suaves e modernas, nada que atrapalhe a experiencia do usuario.
- Foco no Mobile, celulares e tablets, mas tambem deve funcionar bem em desktops.
- O app deve ser bonito, dinâmico, animado, atual, moderno e viciante.
- O app deve ser intuitivo e facil de usar.
- Foco na experiencia do usuario, deve ser prazeroso usar o app.


## 5. Etapas de Desenvolvimento

As etapas seguem ordem lógica, priorizando entrega rápida de valor e arquitetura limpa desde o início. Boas práticas e performance futura são consideradas em todas as fases.

**Fase 0: Planejamento e Setup** (1 dia)  
- Definição final de escopo, variáveis de ambiente e estrutura de pastas.  
- Criação dos projetos no GitHub, Supabase, Vercel e Render.  
- Configuração de conexão segura entre serviços.

**Fase 1: Infraestrutura e Banco de Dados** (1–2 dias)  
- Modelagem da tabela principal (`movies`) com índices otimizados.  
- Implementação de migrations controladas.  
- Configuração de variáveis de ambiente e conexão segura.

**Fase 2: Backend (NestJS)** (2–3 dias)  
- Endpoints CRUD robustos e paginados.    
- Endpoint específico para recomendações (lógica inteligente + cache).  
- Preparação para assincronia e escalabilidade futura.

**Fase 3: Frontend (Next.js)** (3–4 dias)  
- Estrutura com App Router e Server Components.  
- Cache inteligente com TanStack Query.  
- Telas principais: Home (abas), Formulário (cadastro de filme) (botao no canto inferior direito), Stats (estatisticas).
- Design system consistente.

**Fase 4: Features Dinâmicas e Inteligência** (3 dias)   
- Estatísticas com gráficos.  
- Tabela de filmes/series com filtros e ordenacao.

**Fase 5: PWA, Polimento e Deploy** (2 dias)  
- Configuração completa de Progressive Web App.  
- Otimizações de performance (Lighthouse 95+).  
- Deploy automatizado no Vercel e Render.  
- Testes em múltiplos dispositivos.

**Fase 6: Testes, Revisão e Preparação para Futuro** (1–2 dias)  
- Testes de fluxo completo e edge cases.  
- Revisão de código focada em legibilidade e padrões.  
- Documentação interna simples.  
- Estratégias de crescimento (autenticação, notificações, múltiplos usuários).

## 6. Observações Finais

- Todo desenvolvimento segue Clean Architecture e Separation of Concerns.  
- Cache em múltiplas camadas garante velocidade mesmo com crescimento de dados.  
- Migrations e índices no banco evitam gargalos futuros.  
- Design mobile-first e acessibilidade desde o início.  
- Deploy com CI/CD automático.
- palheta de cores sera focada no rosa (neon) e preto tendo um tom moderno
- nosso desenvolvimento sera dividio em checklist de fases ate a conclusao, iremos seguir o desenvolvimento dessa forma
Este plano é flexível e pode ser ajustado conforme o ritmo de desenvolvimento.

---

**Data de criação:** 18 de março de 2026  
**Próximo passo:** Iniciar Fase 0 ou Fase 1