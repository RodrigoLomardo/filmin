import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from '../groups/groups.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SupabaseJwksService } from './services/supabase-jwks.service';

@Module({
  imports: [
    ConfigModule,
    ProfilesModule,
    GroupsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseJwksService, JwtAuthGuard],
  exports: [AuthService, SupabaseJwksService, JwtAuthGuard],
})
export class AuthModule {}
