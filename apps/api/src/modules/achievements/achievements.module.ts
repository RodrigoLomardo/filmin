import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, WatchItem, GroupMember]),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
