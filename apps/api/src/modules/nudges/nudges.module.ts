import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Nudge } from './entities/nudge.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { NudgesService } from './nudges.service';
import { NudgeAiService } from './nudge-ai.service';
import { NudgesController } from './nudges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nudge, WatchItem]), ConfigModule],
  providers: [NudgesService, NudgeAiService],
  controllers: [NudgesController],
  exports: [NudgesService],
})
export class NudgesModule {}
