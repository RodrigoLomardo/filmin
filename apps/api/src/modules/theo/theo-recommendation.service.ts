import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { TmdbService } from '../tmdb/tmdb.service';
import { TmdbTipo } from '../tmdb/dto/tmdb-search-query.dto';
import { BooksService } from '../books/books.service';
import type { ParsedIntent } from './theo-intent.parser';

export interface GenreScore {
  nome: string;
  score: number;
}

export interface ScoredCandidate {
  titulo: string;
  tipo: WatchItemTipo;
  generos: string[];
  score: number;
}

export interface ExternalRecommendation {
  titulo: string;
  tipo: 'filme' | 'serie' | 'livro';
  generos: string[];
}

export interface DuoProfile {
  avgAgreement: number;
  sharedTopGenres: string[];
  divergentGenres: string[];
}

export interface RecommendationContext {
  topGenres: GenreScore[];
  candidates: ScoredCandidate[];
  externalRecommendations: ExternalRecommendation[];
  duoProfile?: DuoProfile;
}

@Injectable()
export class TheoRecommendationService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
    private readonly tmdbService: TmdbService,
    private readonly booksService: BooksService,
  ) {}

  async buildContext(
    groupId: string,
    isDuo: boolean,
    parsedIntent: ParsedIntent,
  ): Promise<RecommendationContext> {
    const [watched, wantToWatch] = await Promise.all([
      this.fetchWatched(groupId),
      this.fetchWantToWatch(groupId, parsedIntent.tipoFilter),
    ]);

    const topGenres = this.computeTopGenres(watched, parsedIntent.moodKeywords);
    const candidates = this.rankCandidates(wantToWatch, topGenres);
    const acervoTitles = this.buildAcervoTitleSet([...watched, ...wantToWatch]);

    const externalRecommendations = await this.fetchExternalRecommendations(
      topGenres,
      parsedIntent.tipoFilter,
      acervoTitles,
      parsedIntent.moodKeywords,
    );

    const duoProfile = isDuo ? this.computeDuoProfile(watched) : undefined;

    return { topGenres, candidates, externalRecommendations, duoProfile };
  }

  private async fetchWatched(groupId: string): Promise<WatchItem[]> {
    return this.watchItemRepo.find({
      where: { groupId, status: WatchItemStatus.ASSISTIDO },
      relations: ['generos'],
      order: { lastRatingAt: 'DESC' },
      take: 40,
    });
  }

  private async fetchWantToWatch(
    groupId: string,
    tipoFilter: WatchItemTipo | null,
  ): Promise<WatchItem[]> {
    return this.watchItemRepo.find({
      where: tipoFilter
        ? { groupId, status: WatchItemStatus.QUERO_ASSISTIR, tipo: tipoFilter }
        : { groupId, status: WatchItemStatus.QUERO_ASSISTIR },
      relations: ['generos'],
      order: { createdAt: 'DESC' },
      take: 30,
    });
  }

  private buildAcervoTitleSet(items: WatchItem[]): Set<string> {
    return new Set(items.map((i) => i.titulo.toLowerCase().trim()));
  }

  private async fetchExternalRecommendations(
    topGenres: GenreScore[],
    tipoFilter: WatchItemTipo | null,
    acervoTitles: Set<string>,
    requestedGenres: string[] = [],
  ): Promise<ExternalRecommendation[]> {
    // Prioriza gêneros pedidos explicitamente; usa histórico como fallback
    const genreNames = requestedGenres.length > 0
      ? [...requestedGenres, ...topGenres.slice(0, 3).map((g) => g.nome)]
      : topGenres.slice(0, 5).map((g) => g.nome);

    if (genreNames.length === 0) return [];
    const results: ExternalRecommendation[] = [];

    try {
      if (tipoFilter === WatchItemTipo.LIVRO) {
        const books = await this.booksService.discoverByGenres(genreNames, 6);
        for (const b of books) {
          if (!acervoTitles.has(b.titulo.toLowerCase().trim())) {
            results.push({ titulo: b.titulo, tipo: 'livro', generos: b.generosNomes });
          }
        }
      } else if (tipoFilter === WatchItemTipo.FILME) {
        const movies = await this.tmdbService.discoverByGenres(genreNames, TmdbTipo.FILME, 8);
        for (const m of movies) {
          if (!acervoTitles.has(m.titulo.toLowerCase().trim())) {
            results.push({ titulo: m.titulo, tipo: 'filme', generos: m.generosNomes });
          }
        }
      } else if (tipoFilter === WatchItemTipo.SERIE) {
        const series = await this.tmdbService.discoverByGenres(genreNames, TmdbTipo.SERIE, 8);
        for (const s of series) {
          if (!acervoTitles.has(s.titulo.toLowerCase().trim())) {
            results.push({ titulo: s.titulo, tipo: 'serie', generos: s.generosNomes });
          }
        }
      } else {
        // Sem filtro: busca filmes + séries em paralelo
        const [movies, series] = await Promise.all([
          this.tmdbService.discoverByGenres(genreNames, TmdbTipo.FILME, 6),
          this.tmdbService.discoverByGenres(genreNames, TmdbTipo.SERIE, 6),
        ]);
        for (const m of movies) {
          if (!acervoTitles.has(m.titulo.toLowerCase().trim())) {
            results.push({ titulo: m.titulo, tipo: 'filme', generos: m.generosNomes });
          }
        }
        for (const s of series) {
          if (!acervoTitles.has(s.titulo.toLowerCase().trim())) {
            results.push({ titulo: s.titulo, tipo: 'serie', generos: s.generosNomes });
          }
        }
      }
    } catch {
      // Falha silenciosa — Theo ainda funciona sem recs externas
    }

    return results.slice(0, 8);
  }

  private computeTopGenres(items: WatchItem[], moodKeywords: string[]): GenreScore[] {
    const genreMap = new Map<string, number>();

    for (const item of items) {
      const rating = Number(item.notaGeral ?? 5);
      const weight = rating / 5;
      for (const genero of item.generos ?? []) {
        genreMap.set(genero.nome, (genreMap.get(genero.nome) ?? 0) + weight);
      }
    }

    for (const mood of moodKeywords) {
      for (const [nome, score] of genreMap) {
        if (nome.toLowerCase().includes(mood)) {
          genreMap.set(nome, score + 3);
        }
      }
    }

    return Array.from(genreMap.entries())
      .map(([nome, score]) => ({ nome, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  private rankCandidates(items: WatchItem[], topGenres: GenreScore[]): ScoredCandidate[] {
    const genreScoreMap = new Map(topGenres.map((g) => [g.nome, g.score]));

    return items
      .map((item) => {
        const generos = (item.generos ?? []).map((g) => g.nome);
        const score = generos.reduce((acc, g) => acc + (genreScoreMap.get(g) ?? 0), 0);
        return { titulo: item.titulo, tipo: item.tipo, generos, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  private computeDuoProfile(items: WatchItem[]): DuoProfile {
    const ratedByBoth = items.filter(
      (i) => i.notaDele != null && i.notaDela != null,
    );

    let avgAgreement = 10;
    if (ratedByBoth.length > 0) {
      const totalDivergence = ratedByBoth.reduce(
        (acc, i) => acc + Math.abs(Number(i.notaDele) - Number(i.notaDela)),
        0,
      );
      avgAgreement = Math.max(0, 10 - totalDivergence / ratedByBoth.length);
    }

    const agreedItems = ratedByBoth.filter(
      (i) => Number(i.notaDele) >= 7 && Number(i.notaDela) >= 7,
    );
    const agreedGenreMap = new Map<string, number>();
    for (const item of agreedItems) {
      for (const g of item.generos ?? []) {
        agreedGenreMap.set(g.nome, (agreedGenreMap.get(g.nome) ?? 0) + 1);
      }
    }
    const sharedTopGenres = Array.from(agreedGenreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([nome]) => nome);

    const divergentItems = ratedByBoth.filter(
      (i) => Math.abs(Number(i.notaDele) - Number(i.notaDela)) >= 3,
    );
    const divergentGenreMap = new Map<string, number>();
    for (const item of divergentItems) {
      for (const g of item.generos ?? []) {
        divergentGenreMap.set(g.nome, (divergentGenreMap.get(g.nome) ?? 0) + 1);
      }
    }
    const divergentGenres = Array.from(divergentGenreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome]) => nome);

    return { avgAgreement, sharedTopGenres, divergentGenres };
  }
}
