import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { Temporada } from './entities/temporada.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { CreateTemporadaDto } from './dto/create-temporada.dto';
import { UpdateTemporadaDto } from './dto/update-temporada.dto';
import { StreakService } from '../streak/streak.service';

@Injectable()
export class TemporadasService {
  constructor(
    @InjectRepository(Temporada)
    private readonly temporadaRepository: Repository<Temporada>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepository: Repository<WatchItem>,

    private readonly streakService: StreakService,
  ) { }

  async create(createTemporadaDto: CreateTemporadaDto, groupId: string, groupTipo: GroupTipo | null = null) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id: createTemporadaDto.watchItemId, groupId },
      relations: { temporadas: true },
    });

    if (!watchItem) {
      throw new NotFoundException(
        `Watch item com id "${createTemporadaDto.watchItemId}" não encontrado.`,
      );
    }

    if (watchItem.tipo !== WatchItemTipo.SERIE) {
      throw new BadRequestException(
        'Só é permitido cadastrar temporadas para watch_items do tipo "serie".',
      );
    }

    const temporadaExistente = await this.temporadaRepository.findOne({
      where: {
        watchItemId: createTemporadaDto.watchItemId,
        numero: createTemporadaDto.numero,
      },
    });

    if (temporadaExistente) {
      throw new BadRequestException(
        `A temporada ${createTemporadaDto.numero} já existe para esta série.`,
      );
    }

    const isSolo = groupTipo === GroupTipo.SOLO;

    if (!isSolo && createTemporadaDto.notaDela == null) {
      throw new BadRequestException(
        'Em grupos duo, temporadas precisam da nota de ambos.',
      );
    }

    const notaDela = isSolo ? null : (createTemporadaDto.notaDela ?? null);
    const notaGeral = isSolo
      ? createTemporadaDto.notaDele
      : notaDela != null
        ? this.calcularNotaGeralTemporada(createTemporadaDto.notaDele, notaDela)
        : null;

    const temporada = this.temporadaRepository.create({
      watchItemId: createTemporadaDto.watchItemId,
      numero: createTemporadaDto.numero,
      notaDele: createTemporadaDto.notaDele,
      notaDela,
      notaGeral,
    });

    const savedTemporada = await this.temporadaRepository.save(temporada);

    await this.recalculateNotaGeralSerie(watchItem.id);

    void this.streakService.registerActivity(groupId);

    return await this.temporadaRepository.findOne({
      where: { id: savedTemporada.id },
      relations: { watchItem: true },
    });
  }

  async findAll(groupId: string) {
    return this.temporadaRepository
      .createQueryBuilder('temporada')
      .innerJoinAndSelect('temporada.watchItem', 'watchItem')
      .where('watchItem.groupId = :groupId', { groupId })
      .orderBy('temporada.numero', 'ASC')
      .getMany();
  }

  async findOne(id: string, groupId: string) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
      relations: { watchItem: true },
    });

    if (!temporada || temporada.watchItem.groupId !== groupId) {
      throw new NotFoundException(`Temporada com id "${id}" não encontrada.`);
    }

    return temporada;
  }

  async update(id: string, updateTemporadaDto: UpdateTemporadaDto, groupId: string, groupTipo: GroupTipo | null = null) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
      relations: { watchItem: true },
    });

    if (!temporada || temporada.watchItem.groupId !== groupId) {
      throw new NotFoundException(`Temporada com id "${id}" não encontrada.`);
    }

    const novoNumero = updateTemporadaDto.numero ?? temporada.numero;

    if (novoNumero !== temporada.numero) {
      const temporadaExistente = await this.temporadaRepository.findOne({
        where: {
          watchItemId: temporada.watchItemId,
          numero: novoNumero,
        },
      });

      if (temporadaExistente && temporadaExistente.id !== temporada.id) {
        throw new BadRequestException(
          `A temporada ${novoNumero} já existe para esta série.`,
        );
      }
    }

    const isSolo = groupTipo === GroupTipo.SOLO;
    const notaDele = updateTemporadaDto.notaDele ?? temporada.notaDele;
    const notaDela = isSolo ? null : (updateTemporadaDto.notaDela ?? temporada.notaDela);

    const tentandoAtualizarNota = updateTemporadaDto.notaDele !== undefined || updateTemporadaDto.notaDela !== undefined;
    if (tentandoAtualizarNota && notaDele == null) {
      throw new BadRequestException('A nota deve ser informada.');
    }
    if (tentandoAtualizarNota && !isSolo && notaDela == null) {
      throw new BadRequestException('Em grupos duo, ambas as notas devem ser informadas.');
    }

    temporada.numero = novoNumero;
    temporada.notaDele = notaDele ?? null;
    temporada.notaDela = notaDela ?? null;
    temporada.notaGeral = notaDele != null
      ? isSolo
        ? notaDele
        : notaDela != null ? this.calcularNotaGeralTemporada(notaDele, notaDela) : null
      : null;

    const updatedTemporada = await this.temporadaRepository.save(temporada);

    await this.recalculateNotaGeralSerie(temporada.watchItemId);

    return await this.temporadaRepository.findOne({
      where: { id: updatedTemporada.id },
      relations: { watchItem: true },
    });
  }

  async remove(id: string, groupId: string) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
      relations: { watchItem: true },
    });

    if (!temporada || temporada.watchItem.groupId !== groupId) {
      throw new NotFoundException(`Temporada com id "${id}" não encontrada.`);
    }

    const watchItemId = temporada.watchItemId;

    await this.temporadaRepository.remove(temporada);
    await this.recalculateNotaGeralSerie(watchItemId);

    return {
      message: `Temporada com id "${id}" removida com sucesso.`,
    };
  }

  private calcularNotaGeralTemporada(notaDele: number, notaDela: number): number {
    return Number(((notaDele + notaDela) / 2).toFixed(1));
  }

  private async recalculateNotaGeralSerie(watchItemId: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id: watchItemId },
      relations: { temporadas: true },
    });

    if (!watchItem) {
      throw new NotFoundException(
        `Watch item com id "${watchItemId}" não encontrado para recálculo.`,
      );
    }

    const temporadas = watchItem.temporadas ?? [];

    const temporadasComNota = temporadas.filter(t => t.notaGeral != null);

    if (temporadasComNota.length === 0) {
      watchItem.notaGeral = null;
    } else {
      const soma = temporadasComNota.reduce((acc, t) => acc + Number(t.notaGeral), 0);
      watchItem.notaGeral = Number((soma / temporadasComNota.length).toFixed(1));
    }

    await this.watchItemRepository.save(watchItem);
  }
}
