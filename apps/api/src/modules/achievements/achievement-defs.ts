export type AchievementEscopo = 'solo_duo' | 'duo_only';

export interface AchievementDef {
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  escopo: AchievementEscopo;
  levelGroup?: string;
  level?: number;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── Cinéfilo (filmes assistidos) ──────────────────────────────────────────
  {
    slug: 'cinefilo_nivel_1',
    nome: 'Cinéfilo I',
    descricao: '10 filmes assistidos',
    icone: '🎬',
    escopo: 'solo_duo',
    levelGroup: 'cinefilo',
    level: 1,
  },
  {
    slug: 'cinefilo_nivel_2',
    nome: 'Cinéfilo II',
    descricao: '30 filmes assistidos',
    icone: '🎬',
    escopo: 'solo_duo',
    levelGroup: 'cinefilo',
    level: 2,
  },
  {
    slug: 'cinefilo_nivel_3',
    nome: 'Cinéfilo III',
    descricao: '50 filmes assistidos',
    icone: '🎬',
    escopo: 'solo_duo',
    levelGroup: 'cinefilo',
    level: 3,
  },

  // ── Maratonista (séries assistidas) ───────────────────────────────────────
  {
    slug: 'maratonista_nivel_1',
    nome: 'Maratonista I',
    descricao: '5 séries assistidas',
    icone: '📺',
    escopo: 'solo_duo',
    levelGroup: 'maratonista',
    level: 1,
  },
  {
    slug: 'maratonista_nivel_2',
    nome: 'Maratonista II',
    descricao: '10 séries assistidas',
    icone: '📺',
    escopo: 'solo_duo',
    levelGroup: 'maratonista',
    level: 2,
  },
  {
    slug: 'maratonista_nivel_3',
    nome: 'Maratonista III',
    descricao: '20 séries assistidas',
    icone: '📺',
    escopo: 'solo_duo',
    levelGroup: 'maratonista',
    level: 3,
  },

  // ── Leitor Ávido (livros assistidos) ──────────────────────────────────────
  {
    slug: 'leitor_avido_nivel_1',
    nome: 'Leitor Ávido I',
    descricao: '10 livros lidos',
    icone: '📚',
    escopo: 'solo_duo',
    levelGroup: 'leitor_avido',
    level: 1,
  },
  {
    slug: 'leitor_avido_nivel_2',
    nome: 'Leitor Ávido II',
    descricao: '20 livros lidos',
    icone: '📚',
    escopo: 'solo_duo',
    levelGroup: 'leitor_avido',
    level: 2,
  },
  {
    slug: 'leitor_avido_nivel_3',
    nome: 'Leitor Ávido III',
    descricao: '50 livros lidos',
    icone: '📚',
    escopo: 'solo_duo',
    levelGroup: 'leitor_avido',
    level: 3,
  },

  // ── Colecionador (itens totais assistidos) ────────────────────────────────
  {
    slug: 'colecionador_nivel_1',
    nome: 'Colecionador I',
    descricao: '50 itens assistidos no total',
    icone: '🏆',
    escopo: 'solo_duo',
    levelGroup: 'colecionador',
    level: 1,
  },
  {
    slug: 'colecionador_nivel_2',
    nome: 'Primeira Centena',
    descricao: '100 itens assistidos no total',
    icone: '🏆',
    escopo: 'solo_duo',
    levelGroup: 'colecionador',
    level: 2,
  },
  {
    slug: 'colecionador_nivel_3',
    nome: 'Lendário',
    descricao: '200 itens assistidos no total',
    icone: '🏆',
    escopo: 'solo_duo',
    levelGroup: 'colecionador',
    level: 3,
  },

  // ── Conquistas únicas ─────────────────────────────────────────────────────
  {
    slug: 'alma_gemea',
    nome: 'Alma Gêmea',
    descricao: '10 itens com nota idêntica ao parceiro',
    icone: '💖',
    escopo: 'duo_only',
  },
];

/** Retorna apenas o nível mais alto de cada levelGroup */
export function filterHighestLevels(defs: AchievementDef[]): AchievementDef[] {
  const grouped = new Map<string, AchievementDef>();
  for (const def of defs) {
    if (!def.levelGroup) continue;
    const current = grouped.get(def.levelGroup);
    if (!current || (def.level ?? 0) > (current.level ?? 0)) {
      grouped.set(def.levelGroup, def);
    }
  }
  return [...grouped.values()];
}
