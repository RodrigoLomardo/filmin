import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import type { TheoIntent, TheoResponse } from './theo.service';
import type { ParsedIntent } from './theo-intent.parser';
import type { RecommendationContext } from './theo-recommendation.service';

export interface TheoWatchContext {
  watched: string[];
  groupTipo: GroupTipo | null;
  parsedIntent: ParsedIntent;
  recommendationCtx: RecommendationContext;
}

const BASE_SYSTEM_PROMPT = `Você é o Theo — assistente de decisão do Filmin, um app pessoal de gerenciamento de filmes, séries e livros.

## Sua ÚNICA função
Ajudar o usuário a decidir o que assistir ou ler, usando os dados do acervo dele.

## Regras rígidas
1. Só fale sobre filmes, séries e livros no contexto do Filmin.
2. Se a pergunta for fora do escopo (política, esportes, ciência, culinária, etc.), diga educadamente que não pode ajudar com isso e redirecione.
3. Responda SEMPRE em português brasileiro.
4. Seja direto, caloroso e conciso — máximo 2 a 3 frases.
5. Nunca invente títulos. Use APENAS títulos da lista "Quero assistir" ou da lista de recomendações externas fornecida no contexto.
6. Prefira sempre os candidatos do "Quero assistir". Use recomendações externas quando o usuário pedir algo novo ou quando o acervo estiver vazio.
7. Quando sugerir um título externo, mencione que é uma sugestão nova fora do acervo.

## Formato de resposta (JSON estrito, sem markdown)
{
  "intent": "recommend_movie" | "recommend_duo" | "surprise_me" | "out_of_scope",
  "message": "sua resposta aqui",
  "suggestions": ["sugestão 1", "sugestão 2"]
}

O campo "suggestions" deve ter no máximo 4 itens curtos (chips de ação), ou array vazio.`;

const DUO_ADDENDUM = `
## Modo DUO ativo
Este grupo é uma dupla. Ao recomendar:
- Priorize candidatos nos gêneros que ambos curtiram.
- Evite gêneros marcados como divergentes.
- Considere o nível de concordância — quanto mais alto, mais seguros são os candidatos.
- Use "recommend_duo" como intent.`;

function buildContextText(ctx: TheoWatchContext): string {
  const lines: string[] = [];

  lines.push(`Tipo de grupo: ${ctx.groupTipo ?? 'solo'}`);

  if (ctx.watched.length > 0) {
    lines.push(`\nRecém assistidos:\n${ctx.watched.join('\n')}`);
  }

  const { topGenres, candidates, duoProfile } = ctx.recommendationCtx;

  if (topGenres.length > 0) {
    const genreList = topGenres.slice(0, 5).map((g) => g.nome).join(', ');
    lines.push(`\nGêneros favoritos detectados: ${genreList}`);
  }

  if (candidates.length > 0) {
    const candidateLines = candidates
      .slice(0, 6)
      .map((c) => {
        const genres = c.generos.length ? ` | ${c.generos.join(', ')}` : '';
        return `- ${c.titulo} (${c.tipo}${genres})`;
      });
    lines.push(
      `\nCandidatos da lista "Quero assistir" ranqueados por afinidade:\n${candidateLines.join('\n')}`,
    );
  } else {
    lines.push('\nLista "Quero assistir" vazia ou sem candidatos para os filtros aplicados.');
  }

  const { externalRecommendations } = ctx.recommendationCtx;
  if (externalRecommendations.length > 0) {
    const extLines = externalRecommendations
      .slice(0, 8)
      .map((r) => {
        const genres = r.generos.length ? ` | ${r.generos.join(', ')}` : '';
        return `- ${r.titulo} (${r.tipo}${genres})`;
      });
    lines.push(
      `\nRecomendações externas (fora do acervo, baseadas nos gêneros favoritos do usuário):\n${extLines.join('\n')}`,
    );
    lines.push(
      'IMPORTANTE: Você pode sugerir títulos externos quando o usuário pedir algo novo que não está no acervo. Sempre deixe claro que são sugestões externas.',
    );
  }

  if (duoProfile) {
    lines.push(`\n## Perfil de dupla`);
    lines.push(`Concordância geral: ${duoProfile.avgAgreement.toFixed(1)}/10`);
    if (duoProfile.sharedTopGenres.length > 0) {
      lines.push(`Gêneros que ambos adoram: ${duoProfile.sharedTopGenres.join(', ')}`);
    }
    if (duoProfile.divergentGenres.length > 0) {
      lines.push(`Gêneros com mais divergência: ${duoProfile.divergentGenres.join(', ')}`);
    }
  }

  if (ctx.parsedIntent.tipoFilter) {
    lines.push(`\nFiltro de tipo detectado: apenas "${ctx.parsedIntent.tipoFilter}"`);
  }
  if (ctx.parsedIntent.moodKeywords.length > 0) {
    lines.push(`Mood detectado na mensagem: ${ctx.parsedIntent.moodKeywords.join(', ')}`);
  }

  return lines.join('\n');
}

@Injectable()
export class TheoGroqService {
  private readonly groq: Groq;
  private readonly logger = new Logger(TheoGroqService.name);

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async ask(userMessage: string, context: TheoWatchContext): Promise<TheoResponse> {
    const isDuo =
      context.groupTipo === GroupTipo.DUO || context.parsedIntent.isDuoRequest;

    const contextText = buildContextText(context);
    const systemPrompt = isDuo
      ? `${BASE_SYSTEM_PROMPT}${DUO_ADDENDUM}\n\n## Contexto do usuário\n${contextText}`
      : `${BASE_SYSTEM_PROMPT}\n\n## Contexto do usuário\n${contextText}`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as Partial<TheoResponse>;

      return {
        intent: (parsed.intent as TheoIntent) ?? 'recommend_movie',
        message: parsed.message ?? 'Não consegui processar. Tente novamente.',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    } catch (err) {
      this.logger.error('Groq API error', err);
      return {
        intent: 'recommend_movie',
        message: 'Estou com dificuldades agora. Tente novamente em instantes.',
        suggestions: [],
      };
    }
  }
}
