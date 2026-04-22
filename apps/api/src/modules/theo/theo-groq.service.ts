import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import type { TheoIntent, TheoResponse } from './theo.service';
import type { ParsedIntent } from './theo-intent.parser';
import type { RecommendationContext } from './theo-recommendation.service';
import type { MemorySnapshot } from './theo-memory.service';
import { buildSystemPrompt } from './theo-persona';

export interface TheoWatchContext {
  watched: string[];
  groupTipo: GroupTipo | null;
  parsedIntent: ParsedIntent;
  recommendationCtx: RecommendationContext;
  memory: MemorySnapshot;
  userEmail: string;
}

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

  if (ctx.memory.recentTitles.length > 0) {
    lines.push(
      `\nTítulos já recomendados nesta sessão (NÃO repetir): ${ctx.memory.recentTitles.join(', ')}`,
    );
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
    const systemPrompt = buildSystemPrompt({
      userEmail: context.userEmail,
      isDuo,
      contextText,
    });

    const historyMessages = context.memory.conversationHistory.map((turn) => ({
      role: turn.role as 'user' | 'assistant',
      content: turn.content,
    }));

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
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
