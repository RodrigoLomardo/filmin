import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { NudgeType } from '../../common/enums/nudge-type.enum';
import { BASE_PERSONA_PROMPT } from '../theo/theo-persona';

export interface NudgeAiContext {
  type: NudgeType;
  titulo?: string;
  diasParado?: number;
  diaSemana?: string;
  horario?: string;
}

const NUDGE_INSTRUCTION = `
Você está enviando uma notificação proativa curta para o usuário dentro do app.
Seja breve (máximo 2 frases). Mantenha seu tom ácido e descontraído — o humor deve surgir naturalmente do contexto, não forçado.
Inclua uma chamada para ação sutil no final.
Responda APENAS com o texto da notificação, sem JSON, sem markdown, sem prefixos.`;

function buildNudgeUserPrompt(ctx: NudgeAiContext): string {
  switch (ctx.type) {
    case NudgeType.SESSION: {
      return `Hoje é ${ctx.diaSemana} e são ${ctx.horario}. Crie uma mensagem proativa convidando o usuário a escolher algo para assistir agora, com o tom do Theo.`;
    }
    case NudgeType.CONTINUITY: {
      return `O usuário está assistindo "${ctx.titulo}" mas não atualizou há ${ctx.diasParado} dias. Crie uma mensagem proativa lembrando ele de continuar a série, com o tom ácido e divertido do Theo.`;
    }
    case NudgeType.INACTIVITY: {
      return `O grupo ficou ${ctx.diasParado} dias sem adicionar ou avaliar nada no Filmin. Crie uma mensagem proativa de reengajamento com o tom do Theo.`;
    }
  }
}

@Injectable()
export class NudgeAiService {
  private readonly groq: Groq;
  private readonly logger = new Logger(NudgeAiService.name);

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async generate(ctx: NudgeAiContext): Promise<string> {
    const systemPrompt = `${BASE_PERSONA_PROMPT}\n${NUDGE_INSTRUCTION}`;
    const userPrompt = buildNudgeUserPrompt(ctx);

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 120,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      this.logger.error('NudgeAiService error', err);
      return '';
    }
  }
}
