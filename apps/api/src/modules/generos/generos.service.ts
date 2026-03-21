import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './entities/genero.entity';

@Injectable()
export class GenerosService {
  constructor(
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) { }

  async findAll() {
    return await this.generoRepository.find({
      order: {
        nome: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    return await this.generoRepository.findOne({
      where: { id },
    });
  }
}