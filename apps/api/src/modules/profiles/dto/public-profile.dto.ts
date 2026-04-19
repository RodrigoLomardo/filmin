export class RecentWatchedItemDto {
  id: string;
  titulo: string;
  tipo: string;
  posterUrl: string | null;
  notaGeral: number | null;
  anoLancamento: number | null;
}

export class PublicProfileStatsDto {
  filmes: number;
  series: number;
  livros: number;
}

export class DuoPartnerDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export class PublicProfileDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  isPrivate: boolean;
  groupTipo: string | null;
  duoPartner: DuoPartnerDto | null;
  streakSequencia: number;
  stats: PublicProfileStatsDto;
  viewersCount: number;
  recentWatched: RecentWatchedItemDto[];
}
