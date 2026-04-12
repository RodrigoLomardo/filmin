import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temporada } from './entities/temporada.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { TemporadasController } from './temporadas.controller';
import { TemporadasService } from './temporadas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Temporada, WatchItem])],
  controllers: [TemporadasController],
  providers: [TemporadasService],
  exports: [TemporadasService],
})
export class TemporadasModule { }