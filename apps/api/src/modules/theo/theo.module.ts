import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { TmdbModule } from '../tmdb/tmdb.module';
import { BooksModule } from '../books/books.module';
import { TheoController } from './theo.controller';
import { TheoService } from './theo.service';
import { TheoGroqService } from './theo-groq.service';
import { TheoRecommendationService } from './theo-recommendation.service';

@Module({
  imports: [TypeOrmModule.forFeature([WatchItem]), TmdbModule, BooksModule],
  controllers: [TheoController],
  providers: [TheoService, TheoGroqService, TheoRecommendationService],
})
export class TheoModule {}
