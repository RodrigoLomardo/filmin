import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Genero } from '../generos/entities/genero.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
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

  async create(createWatchItemDto: CreateWatchItemDto) {
    const generos = await this.validateAndGetGeneros(createWatchItemDto.generosIds);

    this.validateCreateRules(createWatchItemDto);

    const watchItem = this.watchItemRepository.create({
      titulo: createWatchItemDto.titulo,
      tituloOriginal: createWatchItemDto.tituloOriginal,
      anoLancamento: createWatchItemDto.anoLancamento,
      tipo: createWatchItemDto.tipo,
      status: createWatchItemDto.status,
      notaGeral:
        createWatchItemDto.tipo === WatchItemTipo.FILME
          ? createWatchItemDto.notaGeral ?? null
          : null,
      dataAssistida: createWatchItemDto.dataAssistida
        ? new Date(createWatchItemDto.dataAssistida)
        : null,
      rewatchCount: createWatchItemDto.rewatchCount ?? 0,
      observacoes: createWatchItemDto.observacoes ?? null,
      posterUrl: createWatchItemDto.posterUrl ?? null,
      generos,
    });

    return await this.watchItemRepository.save(watchItem);
  }

  async findAll(query: FindAllWatchItemsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.watchItemRepository
      .createQueryBuilder('watchItem')
      .leftJoinAndSelect('watchItem.generos', 'genero')
      .leftJoinAndSelect('watchItem.temporadas', 'temporada');

    if (query.tipo) {
      qb.andWhere('watchItem.tipo = :tipo', { tipo: query.tipo });
    }

    if (query.status) {
      qb.andWhere('watchItem.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(watchItem.titulo ILIKE :search OR watchItem.titulo_original ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortByMap = {
      titulo: 'watchItem.titulo',
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id },
      relations: {
        generos: true,
        temporadas: true,
      },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    return watchItem;
  }

  async update(id: string, updateWatchItemDto: UpdateWatchItemDto) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id },
      relations: {
        generos: true,
        temporadas: true,
      },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    const newTipo = updateWatchItemDto.tipo ?? watchItem.tipo;
    const newStatus = updateWatchItemDto.status ?? watchItem.status;
    const newNotaGeral =
      updateWatchItemDto.notaGeral !== undefined
        ? updateWatchItemDto.notaGeral
        : watchItem.notaGeral;

    this.validateUpdateRules({
      ...watchItem,
      ...updateWatchItemDto,
      tipo: newTipo,
      status: newStatus,
      notaGeral: newNotaGeral,
    });

    if (updateWatchItemDto.generosIds) {
      const generos = await this.validateAndGetGeneros(updateWatchItemDto.generosIds);
      watchItem.generos = generos;
    }

    watchItem.titulo = updateWatchItemDto.titulo ?? watchItem.titulo;
    watchItem.tituloOriginal =
      updateWatchItemDto.tituloOriginal ?? watchItem.tituloOriginal;
    watchItem.anoLancamento =
      updateWatchItemDto.anoLancamento ?? watchItem.anoLancamento;
    watchItem.tipo = newTipo;
    watchItem.status = newStatus;
    watchItem.dataAssistida =
      updateWatchItemDto.dataAssistida !== undefined
        ? updateWatchItemDto.dataAssistida
          ? new Date(updateWatchItemDto.dataAssistida)
          : null
        : watchItem.dataAssistida;
    watchItem.rewatchCount =
      updateWatchItemDto.rewatchCount ?? watchItem.rewatchCount;
    watchItem.observacoes =
      updateWatchItemDto.observacoes !== undefined
        ? updateWatchItemDto.observacoes
        : watchItem.observacoes;
    watchItem.posterUrl =
      updateWatchItemDto.posterUrl !== undefined
        ? updateWatchItemDto.posterUrl
        : watchItem.posterUrl;

    if (newTipo === WatchItemTipo.FILME) {
      watchItem.notaGeral =
        updateWatchItemDto.notaGeral !== undefined
          ? updateWatchItemDto.notaGeral
          : watchItem.notaGeral;
    }

    if (newTipo === WatchItemTipo.SERIE) {
      const temTemporadas = watchItem.temporadas && watchItem.temporadas.length > 0;

      if (!temTemporadas) {
        watchItem.notaGeral = null;
      }
    }

    return await this.watchItemRepository.save(watchItem);
  }

  async remove(id: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id },
    });

    if (!watchItem) {
      throw new NotFoundException(`Watch item com id "${id}" não encontrado.`);
    }

    await this.watchItemRepository.remove(watchItem);

    return {
      message: `Watch item com id "${id}" removido com sucesso.`,
    };
  }

  private async validateAndGetGeneros(generosIds: string[]) {
    const uniqueGeneroIds = [...new Set(generosIds)];

    const generos = await this.generoRepository.find({
      where: uniqueGeneroIds.map((id) => ({ id })),
    });

    if (generos.length !== uniqueGeneroIds.length) {
      throw new BadRequestException(
        'Um ou mais gêneros informados não existem.',
      );
    }

    return generos;
  }

  private validateCreateRules(createWatchItemDto: CreateWatchItemDto) {
    if (
      createWatchItemDto.tipo === WatchItemTipo.SERIE &&
      createWatchItemDto.notaGeral !== undefined
    ) {
      throw new BadRequestException(
        'Séries não podem receber nota_geral no cadastro inicial. A nota será calculada pelas temporadas.',
      );
    }

    if (
      createWatchItemDto.tipo === WatchItemTipo.FILME &&
      createWatchItemDto.status === WatchItemStatus.ASSISTIDO &&
      createWatchItemDto.notaGeral === undefined
    ) {
      throw new BadRequestException(
        'Filmes com status "assistido" devem ter nota_geral informada.',
      );
    }
  }

  private validateUpdateRules(payload: {
    tipo: WatchItemTipo;
    status: WatchItemStatus;
    notaGeral?: number | null;
  }) {
    if (
      payload.tipo === WatchItemTipo.SERIE &&
      payload.notaGeral !== null &&
      payload.notaGeral !== undefined
    ) {
      throw new BadRequestException(
        'Séries não podem ter nota_geral definida manualmente.',
      );
    }

    if (
      payload.tipo === WatchItemTipo.FILME &&
      payload.status === WatchItemStatus.ASSISTIDO &&
      (payload.notaGeral === null || payload.notaGeral === undefined)
    ) {
      throw new BadRequestException(
        'Filmes com status "assistido" devem ter nota_geral informada.',
      );
    }
  }
}