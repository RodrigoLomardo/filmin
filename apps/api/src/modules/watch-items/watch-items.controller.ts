import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
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
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createWatchItemDto: CreateWatchItemDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.create(createWatchItemDto, groupId, user.groupTipo);
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
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindAllWatchItemsQueryDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.findAll(query, groupId);
  }

  @Get('match-pool')
  @ApiOperation({ summary: 'Buscar itens para o Modo Match (status: quero_assistir)' })
  getMatchPool(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.getMatchPool(groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um watch item por id' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.findOne(id, groupId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um watch item' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateWatchItemDto: UpdateWatchItemDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.update(id, updateWatchItemDto, groupId, user.groupTipo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um watch item' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupId = this.requireGroupId(user);
    return this.watchItemsService.remove(id, groupId);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException(
        'Complete o onboarding antes de usar este recurso.',
      );
    }
    return user.groupId;
  }
}
