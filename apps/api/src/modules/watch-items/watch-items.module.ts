import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genero } from '../generos/entities/genero.entity';
import { WatchItem } from './entities/watch-item.entity';
import { WatchItemsController } from './watch-items.controller';
import { WatchItemsService } from './watch-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([WatchItem, Genero])],
  controllers: [WatchItemsController],
  providers: [WatchItemsService],
  exports: [WatchItemsService],
})
export class WatchItemsModule { }