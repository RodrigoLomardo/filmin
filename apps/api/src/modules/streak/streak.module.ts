import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Streak } from './streak.entity';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';

@Module({
  imports: [TypeOrmModule.forFeature([Streak])],
  controllers: [StreakController],
  providers: [StreakService],
  exports: [StreakService],
})
export class StreakModule {}
