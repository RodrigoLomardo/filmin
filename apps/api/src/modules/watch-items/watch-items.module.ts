import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genero } from '../generos/entities/genero.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItem } from './entities/watch-item.entity';
import { WatchItemsController } from './watch-items.controller';
import { WatchItemsService } from './watch-items.service';
import { StreakModule } from '../streak/streak.module';

@Module({
  imports: [TypeOrmModule.forFeature([WatchItem, Genero, GroupMember]), StreakModule],
  controllers: [WatchItemsController],
  providers: [WatchItemsService],
  exports: [WatchItemsService],
})
export class WatchItemsModule { }