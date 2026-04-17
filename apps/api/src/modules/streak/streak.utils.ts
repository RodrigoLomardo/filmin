import { StreakTipo } from '../../common/enums/streak-tipo.enum';

/**
 * Returns the start of the period containing `date` for the given streak tipo.
 * All dates are UTC.
 */
export function getStartOfPeriod(tipo: StreakTipo, date: Date): Date {
  const d = new Date(date);

  switch (tipo) {
    case StreakTipo.DAILY: {
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case StreakTipo.WEEKEND: {
      // Weekend = Friday, Saturday, Sunday.
      // Period start = most recent Friday on or before `date`.
      // (day - 5 + 7) % 7 gives days to subtract to reach Friday.
      // day=0 (Sun) → 2, day=5 (Fri) → 0, day=6 (Sat) → 1, Mon–Thu → 3..6
      const day = d.getUTCDay();
      const daysToFriday = (day - 5 + 7) % 7;
      d.setUTCDate(d.getUTCDate() - daysToFriday);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case StreakTipo.MONTHLY: {
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    }
  }
}

/**
 * Returns true if the activity date is a valid day for the given streak tipo.
 * For WEEKEND, only Fri/Sat/Sun count; other tipos accept any day.
 */
export function isValidActivityDay(tipo: StreakTipo, date: Date): boolean {
  if (tipo === StreakTipo.WEEKEND) {
    const day = date.getUTCDay();
    return day === 0 || day === 5 || day === 6;
  }
  return true;
}

/**
 * Returns true if `prev` and `next` belong to the same period.
 */
export function isSamePeriod(tipo: StreakTipo, prev: Date, next: Date): boolean {
  return getStartOfPeriod(tipo, prev).getTime() === getStartOfPeriod(tipo, next).getTime();
}

/**
 * Returns true if `next` is in the immediately consecutive period after `prev`.
 * DAILY  → next day
 * WEEKEND → next Friday (+7 days from current period Friday)
 * MONTHLY → next calendar month
 */
export function isConsecutivePeriod(tipo: StreakTipo, prev: Date, next: Date): boolean {
  const startPrev = getStartOfPeriod(tipo, prev);
  const startNext = getStartOfPeriod(tipo, next);

  switch (tipo) {
    case StreakTipo.DAILY: {
      const expected = new Date(startPrev);
      expected.setUTCDate(startPrev.getUTCDate() + 1);
      return startNext.getTime() === expected.getTime();
    }
    case StreakTipo.WEEKEND: {
      const expected = new Date(startPrev);
      expected.setUTCDate(startPrev.getUTCDate() + 7);
      return startNext.getTime() === expected.getTime();
    }
    case StreakTipo.MONTHLY: {
      const expected = new Date(startPrev);
      expected.setUTCMonth(startPrev.getUTCMonth() + 1);
      return startNext.getTime() === expected.getTime();
    }
  }
}

export interface StreakUpdateResult {
  sequenciaAtual: number;
  maiorSequencia: number;
  periodoAtualValido: boolean;
}

/**
 * Computes the new streak values after registering an activity at `now`.
 * Does NOT handle the isValidActivityDay check — caller must do it first.
 */
export function computeStreakUpdate(
  tipo: StreakTipo,
  sequenciaAtual: number,
  maiorSequencia: number,
  ultimoRegistroEm: Date | null,
  now: Date,
): StreakUpdateResult {
  if (!ultimoRegistroEm) {
    return {
      sequenciaAtual: 1,
      maiorSequencia: Math.max(maiorSequencia, 1),
      periodoAtualValido: true,
    };
  }

  if (isSamePeriod(tipo, ultimoRegistroEm, now)) {
    return { sequenciaAtual, maiorSequencia, periodoAtualValido: true };
  }

  if (isConsecutivePeriod(tipo, ultimoRegistroEm, now)) {
    const newSeq = sequenciaAtual + 1;
    return {
      sequenciaAtual: newSeq,
      maiorSequencia: Math.max(maiorSequencia, newSeq),
      periodoAtualValido: true,
    };
  }

  return { sequenciaAtual: 1, maiorSequencia, periodoAtualValido: true };
}
