import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileViewer } from './entities/profile-viewer.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { Streak } from '../streak/streak.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, ProfileViewer, GroupMember, WatchItem, Streak])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [TypeOrmModule, ProfilesService],
})
export class ProfilesModule {}
