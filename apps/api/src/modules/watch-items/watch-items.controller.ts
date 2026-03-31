import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { UpdateWatchItemDto } from './dto/update-watch-item.dto';
import { FindAllWatchItemsQueryDto } from './dto/find-all-watch-items-query.dto';
import { WatchItemsService } from './watch-items.service';

@ApiTags('watch-items')
@Controller('watch-items')
export class WatchItemsController {
  constructor(private readonly watchItemsService: WatchItemsService) { }

  @Post()
  @ApiOperation({ summary: 'Criar um watch item' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createWatchItemDto: CreateWatchItemDto) {
    return this.watchItemsService.create(createWatchItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar watch items com filtros e paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'tipo', required: false, example: 'filme' })
  @ApiQuery({ name: 'status', required: false, example: 'assistido' })
  @ApiQuery({ name: 'search', required: false, example: 'dark' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'DESC' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  findAll(@Query() query: FindAllWatchItemsQueryDto) {
    return this.watchItemsService.findAll(query);
  }

  @Get('match-pool')
  @ApiOperation({ summary: 'Buscar itens para o Modo Match (status: quero_assistir)' })
  getMatchPool() {
    return this.watchItemsService.getMatchPool();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um watch item por id' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  findOne(@Param('id') id: string) {
    return this.watchItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um watch item' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateWatchItemDto: UpdateWatchItemDto,
  ) {
    return this.watchItemsService.update(id, updateWatchItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um watch item' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  remove(@Param('id') id: string) {
    return this.watchItemsService.remove(id);
  }
}