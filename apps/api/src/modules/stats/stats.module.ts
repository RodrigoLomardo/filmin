import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([WatchItem])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
