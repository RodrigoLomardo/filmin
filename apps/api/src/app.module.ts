import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { GenerosModule } from './modules/generos/generos.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { TemporadasModule } from './modules/temporadas/temporadas.module';
import { WatchItemsModule } from './modules/watch-items/watch-items.module';
import { StatsModule } from './modules/stats/stats.module';
import { TmdbModule } from './modules/tmdb/tmdb.module';
import { BooksModule } from './modules/books/books.module';
import { StreakModule } from './modules/streak/streak.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: configService.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
    WatchItemsModule,
    StreakModule,
    StatsModule,
    TmdbModule,
    BooksModule,
    TemporadasModule,
    GenerosModule,
    ProfilesModule,
    GroupsModule,
    AuthModule,
    NotificationsModule,
    AchievementsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }