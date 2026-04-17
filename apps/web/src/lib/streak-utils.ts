import type { Streak, StreakTipo } from '@/types/streak';

/**
 * Retorna o timestamp (em ms) do início do período que contém `date`,
 * espelhando exatamente a lógica de `getStartOfPeriod` do backend.
 *
 * WEEKEND: mapeia Mon–Thu de volta para a Sexta anterior.
 * Isso faz com que Mon–Thu sejam tratados como "ainda no mesmo período"
 * do fim de semana que acabou de passar — o fogo permanece aceso.
 */
function getStartOfPeriodMs(tipo: StreakTipo, date: Date): number {
  const d = new Date(date);

  switch (tipo) {
    case 'daily': {
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    }
    case 'weekend': {
      // (day - 5 + 7) % 7: dias a subtrair para chegar na Sexta mais recente
      // Dom(0)→2, Sex(5)→0, Sab(6)→1, Seg(1)→3, Ter(2)→4, Qua(3)→5, Qui(4)→6
      const day = d.getUTCDay();
      const daysToFriday = (day - 5 + 7) % 7;
      d.setUTCDate(d.getUTCDate() - daysToFriday);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    }
    case 'monthly': {
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
    }
  }
}

/**
 * Determina se o fogo está **atualmente aceso** para exibição no frontend.
 *
 * Regra: o `ultimoRegistroEm` e o instante atual devem pertencer ao mesmo
 * "período" (conforme o tipo), usando a mesma lógica do backend.
 *
 * Para WEEKEND, Seg–Qui mapeiam para a Sexta anterior, então o fogo
 * permanece aceso durante a semana após uma atividade no fim de semana —
 * e apaga na próxima Sexta (início de um novo período sem atividade).
 */
export function isFireActive(streak: Streak): boolean {
  if (!streak.ultimoRegistroEm || streak.sequenciaAtual === 0) return false;

  const lastMs = getStartOfPeriodMs(streak.tipo, new Date(streak.ultimoRegistroEm));
  const nowMs  = getStartOfPeriodMs(streak.tipo, new Date());

  return lastMs === nowMs;
}
