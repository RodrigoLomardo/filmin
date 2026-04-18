import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, WatchItem]), NotificationsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [TypeOrmModule, GroupsService],
})
export class GroupsModule {}
