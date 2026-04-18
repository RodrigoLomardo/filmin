import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { SupabaseJwksService } from '../auth/services/supabase-jwks.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [NotificationsController],
  providers: [NotificationsService, SupabaseJwksService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
