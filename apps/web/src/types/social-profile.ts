export type SearchProfileResult = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isPrivate: boolean;
  groupTipo: 'solo' | 'duo' | null;
};

export type DuoPartner = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

export type RecentWatchedItem = {
  id: string;
  titulo: string;
  tipo: string;
  posterUrl: string | null;
  notaGeral: number | null;
  anoLancamento: number | null;
};

export type PublicProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  isPrivate: boolean;
  groupTipo: 'solo' | 'duo' | null;
  duoPartner: DuoPartner | null;
  streakSequencia: number;
  stats: {
    filmes: number;
    series: number;
    livros: number;
  };
  viewersCount: number;
  recentWatched: RecentWatchedItem[];
};

export type ProfileViewerEntry = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  viewedAt: string;
};

export type ProfileViewersResponse = {
  count: number;
  viewers: ProfileViewerEntry[];
};
