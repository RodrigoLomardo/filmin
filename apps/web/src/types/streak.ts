export type StreakTipo = 'daily' | 'weekend' | 'monthly';

export interface Streak {
  id: string;
  groupId: string;
  tipo: StreakTipo;
  sequenciaAtual: number;
  maiorSequencia: number;
  ultimoRegistroEm: string | null;
  periodoAtualValido: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SetStreakTipoPayload {
  tipo: StreakTipo;
}
