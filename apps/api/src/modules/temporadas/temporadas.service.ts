import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { Temporada } from './entities/temporada.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { CreateTemporadaDto } from './dto/create-temporada.dto';
import { UpdateTemporadaDto } from './dto/update-temporada.dto';

@Injectable()
export class TemporadasService {
  constructor(
    @InjectRepository(Temporada)
    private readonly temporadaRepository: Repository<Temporada>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepository: Repository<WatchItem>,
  ) { }

  async create(createTemporadaDto: CreateTemporadaDto) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id: createTemporadaDto.watchItemId },
      relations: {
        temporadas: true,
      },
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

    const temporada = this.temporadaRepository.create({
      watchItemId: createTemporadaDto.watchItemId,
      numero: createTemporadaDto.numero,
      nota: createTemporadaDto.nota,
    });

    const savedTemporada = await this.temporadaRepository.save(temporada);

    await this.recalculateNotaGeral(watchItem.id);

    return await this.temporadaRepository.findOne({
      where: { id: savedTemporada.id },
      relations: {
        watchItem: true,
      },
    });
  }

  async findAll() {
    return await this.temporadaRepository.find({
      relations: {
        watchItem: true,
      },
      order: {
        numero: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
      relations: {
        watchItem: true,
      },
    });

    if (!temporada) {
      throw new NotFoundException(`Temporada com id "${id}" não encontrada.`);
    }

    return temporada;
  }

  async update(id: string, updateTemporadaDto: UpdateTemporadaDto) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
      relations: {
        watchItem: true,
      },
    });

    if (!temporada) {
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

    temporada.numero = novoNumero;
    temporada.nota = updateTemporadaDto.nota ?? temporada.nota;

    const updatedTemporada = await this.temporadaRepository.save(temporada);

    await this.recalculateNotaGeral(temporada.watchItemId);

    return await this.temporadaRepository.findOne({
      where: { id: updatedTemporada.id },
      relations: {
        watchItem: true,
      },
    });
  }

  async remove(id: string) {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
    });

    if (!temporada) {
      throw new NotFoundException(`Temporada com id "${id}" não encontrada.`);
    }

    const watchItemId = temporada.watchItemId;

    await this.temporadaRepository.remove(temporada);

    await this.recalculateNotaGeral(watchItemId);

    return {
      message: `Temporada com id "${id}" removida com sucesso.`,
    };
  }

  private async recalculateNotaGeral(watchItemId: string) {
    const watchItem = await this.watchItemRepository.findOne({
      where: { id: watchItemId },
      relations: {
        temporadas: true,
      },
    });

    if (!watchItem) {
      throw new NotFoundException(
        `Watch item com id "${watchItemId}" não encontrado para recálculo.`,
      );
    }

    if (watchItem.tipo !== WatchItemTipo.SERIE) {
      throw new BadRequestException(
        'O recálculo de nota geral por temporadas só pode ser feito para séries.',
      );
    }

    const temporadas = watchItem.temporadas ?? [];

    if (temporadas.length === 0) {
      watchItem.notaGeral = null;
      await this.watchItemRepository.save(watchItem);
      return;
    }

    const somaNotas = temporadas.reduce(
      (acc, temporada) => acc + Number(temporada.nota),
      0,
    );

    const media = somaNotas / temporadas.length;
    watchItem.notaGeral = Number(media.toFixed(1));

    await this.watchItemRepository.save(watchItem);
  }
}