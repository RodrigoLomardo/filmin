import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from '../generos/entities/genero.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { RatingStatus } from '../../common/enums/rating-status.enum';
import { RatingField } from '../../common/enums/rating-field.enum';
import { WatchItem } from './entities/watch-item.entity';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { UpdateWatchItemDto } from './dto/update-watch-item.dto';
import { RateWatchItemDto } from './dto/rate-watch-item.dto';
import { FindAllWatchItemsQueryDto } from './dto/find-all-watch-items-query.dto';
import { StreakService } from '../streak/streak.service';

@Injectable()
export class WatchItemsService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepository: Repository<WatchItem>,

    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,

    private readonly streakService: StreakService,
  ) { }

  async create(
    createWatchItemDto: CreateWatchItemDto,
    groupId: string,
    groupTipo: GroupTipo | null,
    profileId: string,
  ) {
    const generos = await this.validateAndGetGeneros(createWatchItemDto.generosIds);

    this.validateNotasRules({
      tipo: createWatchItemDto.tipo,
      status: createWatchItemDto.status,
      notaDele: createWatchItemDto.notaDele,
      notaDela: createWatchItemDto.notaDela,
      groupTipo,
    });

    const isMidiaNota = createWatchItemDto.tipo === WatchItemTipo.FILME || createWatchItemDto.tipo === WatchItemTipo.LIVRO;
    const isSolo = groupTipo === GroupTipo.SOLO;

    const notaDele = isMidiaNota ? createWatchItemDto.notaDele ?? null : null;
    const notaDela = isMidiaNota && !isSolo ? createWatchItemDto.notaDela ?? null : null;

    const notaGeral = isMidiaNota && notaDele != null
      ? isSolo
        ? notaDele
        : notaDela != null
          ? this.calcularNotaGeralDuo(notaDele, notaDela)
          : null
      : null;

    const { ratingStatus, pendingForProfileId, firstRatingByProfileId, firstRatingField, lastRatingAt } =
      await this.resolveRatingStatus(groupId, groupTipo, notaDele, notaDela, profileId);

    const watchItem = this.watchItemRepository.create({
      titulo: createWatchItemDto.titulo,
      tituloOriginal: createWatchItemDto.tituloOriginal,
      anoLancamento: createWatchItemDto.anoLancamento,
      tipo: createWatchItemDto.tipo,
      status: createWatchItemDto.status,
      notaDele,
      notaDela,
      notaGeral,
      dataAssistida: createWatchItemDto.dataAssistida
        ? new Date(createWatchItemDto.dataAssistida)
        : null,
      rewatchCount: createWatchItemDto.rewatchCount ?? 0,
      observacoes: createWatchItemDto.observacoes ?? null,
      posterUrl: createWatchItemDto.posterUrl ?? null,
      ratingStatus,
      pendingForProfileId,
      firstRatingByProfileId,
      firstRatingField,
      lastRatingAt,
      groupId,
      generos,
    });

    const saved = await this.watchItemRepository.save(watchItem);

    void this.streakService.registerActivity(groupId);

    return saved;
  }

  async findAll(query: FindAllWatchItemsQueryDto, groupId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.watchItemRepository
      .createQueryBuilder('watchItem')
      .leftJoinAndSelect('watchItem.generos', 'genero')
      .leftJoinAndSelect('watchItem.temporadas', 'temporada')
      .where('watchItem.groupId = :groupId', { groupId });

    if (query.tipo) {
      qb.andWhere('watchItem.tipo = :tipo', { tipo: query.tipo });
    }

    if (query.status) {
      qb.andWhere('watchItem.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(watchItem.titulo ILIKE :search OR watchItem.tituloOriginal ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortByMap: Record<string, string> = {
      titulo: 'watchItem.titulo',
      notaDele: 'watchItem.notaDele',
      notaDela: 'watchItem.notaDela',
      notaGeral: 'watchItem.notaGeral',
      dataAssistida: 'watchItem.dataAssistida',
      createdAt: 'watchItem.createdAt',
      anoLancamento: 'watchItem.anoLancamento',
    };

    const sortBy = sortByMap[query.sortBy ?? 'createdAt'];
    const sortOrder = query.sortOrder ?? 'DESC';

    qb.orderBy(sortBy, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMatchPool(groupId: string) {
    return this.watchItemRepository.find({
      where: { status: WatchItemStatus.QUERO_ASSISTIR, groupId },
      relations: { generos: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPending(groupId: string, profileId: string) {
    return this.watchItemRepository.find({
      where: {
        groupId,
        ratingStatus: RatingStatus.AWAITING_PARTNER,
        pendingForProfileId: profileId,
      },
      relations: { generos: true },
      order: { lastRatingAt: 'ASC' },
    });
  }

  async findOne(id: string, groupId: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id, groupId },
      relations: { generos: true, temporadas: true },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    return watchItem;
  }

  async rate(
    id: string,
    dto: RateWatchItemDto,
    groupId: string,
    groupTipo: GroupTipo | null,
    profileId: string,
  ) {
    if (groupTipo !== GroupTipo.DUO) {
      throw new BadRequestException('Avaliação dupla só é aplicável em grupos Duo.');
    }

    const watchItem = await this.watchItemRepository.findOne({
      where: { id, groupId },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    const isMidiaNota = watchItem.tipo === WatchItemTipo.FILME || watchItem.tipo === WatchItemTipo.LIVRO;
    if (!isMidiaNota) {
      throw new BadRequestException('Séries não suportam avaliação individual por nota.');
    }

    if (watchItem.ratingStatus !== RatingStatus.AWAITING_PARTNER) {
      throw new BadRequestException('Este item não está aguardando avaliação do parceiro.');
    }

    if (watchItem.pendingForProfileId !== profileId) {
      throw new BadRequestException('Você não é o membro pendente desta avaliação.');
    }

    if (!watchItem.firstRatingField) {
      throw new BadRequestException('Estado de avaliação inconsistente: slot da primeira avaliação não registrado.');
    }

    // Use the explicit first-rating slot to determine which field to protect and which to fill
    if (watchItem.firstRatingField === RatingField.DELE) {
      watchItem.notaDela = dto.nota;
    } else {
      watchItem.notaDele = dto.nota;
    }

    watchItem.notaGeral = this.calcularNotaGeralDuo(
      watchItem.notaDele as number,
      watchItem.notaDela as number,
    );
    watchItem.ratingStatus = RatingStatus.COMPLETE;
    watchItem.pendingForProfileId = null;
    watchItem.lastRatingAt = new Date();

    const saved = await this.watchItemRepository.save(watchItem);

    void this.streakService.registerActivity(groupId);

    return saved;
  }

  async update(id: string, updateWatchItemDto: UpdateWatchItemDto, groupId: string, groupTipo: GroupTipo | null, profileId: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id, groupId },
      relations: { generos: true, temporadas: true },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    const isChangingRatingFields =
      updateWatchItemDto.notaDele !== undefined || updateWatchItemDto.notaDela !== undefined;

    if (isChangingRatingFields && watchItem.ratingStatus != null) {
      if (
        watchItem.ratingStatus === RatingStatus.AWAITING_PARTNER &&
        watchItem.pendingForProfileId === profileId &&
        watchItem.firstRatingField != null
      ) {
        const pendingNota =
          watchItem.firstRatingField === RatingField.DELE
            ? updateWatchItemDto.notaDela
            : updateWatchItemDto.notaDele;

        if (pendingNota == null) {
          throw new BadRequestException('Informe sua nota para concluir a avaliação dupla.');
        }

        return this.rate(id, { nota: pendingNota }, groupId, groupTipo, profileId);
      }

      throw new BadRequestException(
        'Este item possui avaliação dupla ativa. Use PATCH /:id/rate para submeter a avaliação pendente.',
      );
    }

    const newTipo = updateWatchItemDto.tipo ?? watchItem.tipo;
    const newStatus = updateWatchItemDto.status ?? watchItem.status;
    const newNotaDele = updateWatchItemDto.notaDele !== undefined ? updateWatchItemDto.notaDele : watchItem.notaDele;
    const newNotaDela = updateWatchItemDto.notaDela !== undefined ? updateWatchItemDto.notaDela : watchItem.notaDela;

    this.validateNotasRules({ tipo: newTipo, status: newStatus, notaDele: newNotaDele, notaDela: newNotaDela, groupTipo });

    if (updateWatchItemDto.generosIds) {
      const generos = await this.validateAndGetGeneros(updateWatchItemDto.generosIds);
      watchItem.generos = generos;
    }

    watchItem.titulo = updateWatchItemDto.titulo ?? watchItem.titulo;
    watchItem.tituloOriginal = updateWatchItemDto.tituloOriginal ?? watchItem.tituloOriginal;
    watchItem.anoLancamento = updateWatchItemDto.anoLancamento ?? watchItem.anoLancamento;
    watchItem.tipo = newTipo;
    watchItem.status = newStatus;
    watchItem.dataAssistida = updateWatchItemDto.dataAssistida !== undefined
      ? updateWatchItemDto.dataAssistida ? new Date(updateWatchItemDto.dataAssistida) : null
      : watchItem.dataAssistida;
    watchItem.rewatchCount = updateWatchItemDto.rewatchCount ?? watchItem.rewatchCount;
    watchItem.observacoes = updateWatchItemDto.observacoes !== undefined ? updateWatchItemDto.observacoes : watchItem.observacoes;
    watchItem.posterUrl = updateWatchItemDto.posterUrl !== undefined ? updateWatchItemDto.posterUrl : watchItem.posterUrl;

    const isMidiaNota = newTipo === WatchItemTipo.FILME || newTipo === WatchItemTipo.LIVRO;
    const isSolo = groupTipo === GroupTipo.SOLO;

    if (isMidiaNota) {
      watchItem.notaDele = newNotaDele ?? null;
      watchItem.notaDela = isSolo ? null : (newNotaDela ?? null);
      watchItem.notaGeral = newNotaDele != null
        ? isSolo
          ? newNotaDele
          : newNotaDela != null ? this.calcularNotaGeralDuo(newNotaDele, newNotaDela) : null
        : null;
    }

    if (newTipo === WatchItemTipo.SERIE) {
      watchItem.notaDele = null;
      watchItem.notaDela = null;
    }

    // Activate dual rating sync if notes are set for the first time in a DUO group
    const shouldApplySync =
      isMidiaNota &&
      !isSolo &&
      watchItem.ratingStatus == null &&
      (watchItem.notaDele != null || watchItem.notaDela != null);

    if (shouldApplySync) {
      const sync = await this.resolveRatingStatus(
        groupId,
        groupTipo,
        watchItem.notaDele as number | null,
        watchItem.notaDela as number | null,
        profileId,
      );
      watchItem.ratingStatus = sync.ratingStatus;
      watchItem.pendingForProfileId = sync.pendingForProfileId;
      watchItem.firstRatingByProfileId = sync.firstRatingByProfileId;
      watchItem.firstRatingField = sync.firstRatingField;
      watchItem.lastRatingAt = sync.lastRatingAt;
    }

    return await this.watchItemRepository.save(watchItem);
  }

  async remove(id: string, groupId: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id, groupId },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    await this.watchItemRepository.remove(watchItem);

    return { message: `Watch item com id "${id}" removido com sucesso.` };
  }

  private async resolveRatingStatus(
    groupId: string,
    groupTipo: GroupTipo | null,
    notaDele: number | null,
    notaDela: number | null,
    profileId: string,
  ): Promise<{
    ratingStatus: RatingStatus | null;
    pendingForProfileId: string | null;
    firstRatingByProfileId: string | null;
    firstRatingField: RatingField | null;
    lastRatingAt: Date | null;
  }> {
    const empty = { ratingStatus: null, pendingForProfileId: null, firstRatingByProfileId: null, firstRatingField: null, lastRatingAt: null };

    if (groupTipo !== GroupTipo.DUO) return empty;

    const hasAnyRating = notaDele != null || notaDela != null;
    if (!hasAnyRating) return empty;

    // Determine which field the current user is filling
    const firstRatingField: RatingField = notaDele != null ? RatingField.DELE : RatingField.DELA;

    if (notaDele != null && notaDela != null) {
      return {
        ratingStatus: RatingStatus.COMPLETE,
        pendingForProfileId: null,
        firstRatingByProfileId: profileId,
        firstRatingField,
        lastRatingAt: new Date(),
      };
    }

    // Only one note provided — find the other member
    const members = await this.groupMemberRepository.find({
      where: { groupId },
      order: { joinedAt: 'ASC' },
    });

    const otherMember = members.find((m) => m.profileId !== profileId);

    return {
      ratingStatus: RatingStatus.AWAITING_PARTNER,
      pendingForProfileId: otherMember?.profileId ?? null,
      firstRatingByProfileId: profileId,
      firstRatingField,
      lastRatingAt: new Date(),
    };
  }

  private calcularNotaGeralDuo(notaDele: number, notaDela: number): number {
    return Number(((Number(notaDele) + Number(notaDela)) / 2).toFixed(1));
  }

  private async validateAndGetGeneros(generosIds: string[]) {
    const uniqueGeneroIds = [...new Set(generosIds)];

    const generos = await this.generoRepository.find({
      where: uniqueGeneroIds.map((id) => ({ id })),
    });

    if (generos.length !== uniqueGeneroIds.length) {
      throw new BadRequestException('Um ou mais gêneros informados não existem.');
    }

    return generos;
  }

  private validateNotasRules(payload: {
    tipo: WatchItemTipo;
    status: WatchItemStatus;
    notaDele?: number | null;
    notaDela?: number | null;
    groupTipo: GroupTipo | null;
  }) {
    const isMidiaNota = payload.tipo === WatchItemTipo.FILME || payload.tipo === WatchItemTipo.LIVRO;
    if (!isMidiaNota || payload.status !== WatchItemStatus.ASSISTIDO) return;

    const hasAnyNota = payload.notaDele != null || payload.notaDela != null;

    if (!hasAnyNota) {
      throw new BadRequestException(
        'Filmes e livros com status "assistido" precisam de pelo menos uma nota.',
      );
    }
  }
}
