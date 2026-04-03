import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from '../generos/entities/genero.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { WatchItem } from './entities/watch-item.entity';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { UpdateWatchItemDto } from './dto/update-watch-item.dto';
import { FindAllWatchItemsQueryDto } from './dto/find-all-watch-items-query.dto';

@Injectable()
export class WatchItemsService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepository: Repository<WatchItem>,

    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) { }

  async create(createWatchItemDto: CreateWatchItemDto, groupId: string, groupTipo: GroupTipo | null) {
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

    const notaGeral = isMidiaNota && createWatchItemDto.notaDele != null
      ? isSolo
        ? createWatchItemDto.notaDele
        : createWatchItemDto.notaDela != null
          ? this.calcularNotaGeralDuo(createWatchItemDto.notaDele, createWatchItemDto.notaDela)
          : null
      : null;

    const watchItem = this.watchItemRepository.create({
      titulo: createWatchItemDto.titulo,
      tituloOriginal: createWatchItemDto.tituloOriginal,
      anoLancamento: createWatchItemDto.anoLancamento,
      tipo: createWatchItemDto.tipo,
      status: createWatchItemDto.status,
      notaDele: isMidiaNota ? createWatchItemDto.notaDele ?? null : null,
      notaDela: isMidiaNota && !isSolo ? createWatchItemDto.notaDela ?? null : null,
      notaGeral,
      dataAssistida: createWatchItemDto.dataAssistida
        ? new Date(createWatchItemDto.dataAssistida)
        : null,
      rewatchCount: createWatchItemDto.rewatchCount ?? 0,
      observacoes: createWatchItemDto.observacoes ?? null,
      posterUrl: createWatchItemDto.posterUrl ?? null,
      groupId,
      generos,
    });

    return await this.watchItemRepository.save(watchItem);
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

  async update(id: string, updateWatchItemDto: UpdateWatchItemDto, groupId: string, groupTipo: GroupTipo | null) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id, groupId },
      relations: { generos: true, temporadas: true },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
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

  private calcularNotaGeralDuo(notaDele: number, notaDela: number): number {
    return Number(((notaDele + notaDela) / 2).toFixed(1));
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

    if (payload.notaDele == null) {
      throw new BadRequestException(
        'Filmes e livros com status "assistido" precisam de pelo menos uma nota.',
      );
    }

    if (payload.groupTipo === GroupTipo.DUO && payload.notaDela == null) {
      throw new BadRequestException(
        'Em grupos duo, filmes e livros com status "assistido" precisam da nota de ambos.',
      );
    }
  }
}
