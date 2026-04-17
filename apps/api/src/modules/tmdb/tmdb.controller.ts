import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TmdbService } from './tmdb.service';
import { TmdbSearchQueryDto, TmdbTipo } from './dto/tmdb-search-query.dto';

@ApiTags('tmdb')
@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar filmes ou séries no TMDB por nome' })
  @ApiQuery({ name: 'query', example: 'Inception' })
  @ApiQuery({ name: 'tipo', enum: TmdbTipo })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  search(@Query() query: TmdbSearchQueryDto) {
    return this.tmdbService.search(query.query, query.tipo);
  }

  @Get(':tipo/:id')
  @ApiOperation({ summary: 'Buscar detalhes de um item do TMDB por ID' })
  @ApiParam({ name: 'tipo', enum: TmdbTipo })
  @ApiParam({ name: 'id', example: 27205 })
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Param('tipo', new ParseEnumPipe(TmdbTipo)) tipo: TmdbTipo,
  ) {
    return this.tmdbService.findById(id, tipo);
  }
}
