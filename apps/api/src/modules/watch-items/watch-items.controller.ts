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
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { UpdateWatchItemDto } from './dto/update-watch-item.dto';
import { RateWatchItemDto } from './dto/rate-watch-item.dto';
import { FindAllWatchItemsQueryDto } from './dto/find-all-watch-items-query.dto';
import { WatchItemsService } from './watch-items.service';

@ApiTags('watch-items')
@Controller('watch-items')
export class WatchItemsController {
  constructor(private readonly watchItemsService: WatchItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um watch item (gallery: duo|solo)' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createWatchItemDto: CreateWatchItemDto,
  ) {
    const { groupId, effectiveTipo } = this.resolveGalleryContext(user, createWatchItemDto.gallery);
    return this.watchItemsService.create(createWatchItemDto, groupId, effectiveTipo, user.profileId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar watch items com filtros e paginação (gallery: duo|solo)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'tipo', required: false, example: 'filme' })
  @ApiQuery({ name: 'status', required: false, example: 'assistido' })
  @ApiQuery({ name: 'search', required: false, example: 'dark' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'DESC' })
  @ApiQuery({ name: 'gallery', required: false, enum: ['duo', 'solo'] })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindAllWatchItemsQueryDto,
  ) {
    const { groupId } = this.resolveGalleryContext(user, query.gallery);
    return this.watchItemsService.findAll(query, groupId);
  }

  @Get('match-pool')
  @ApiOperation({ summary: 'Buscar itens para o Modo Match (status: quero_assistir)' })
  getMatchPool(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireDuoGroupId(user);
    return this.watchItemsService.getMatchPool(groupId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Listar itens pendentes de avaliação pelo usuário atual (apenas grupos Duo)' })
  findPending(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireDuoGroupId(user);
    return this.watchItemsService.findPending(groupId, user.profileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um watch item por id (busca em todas as galerias do usuário)' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupIds = this.getUserGroupIds(user);
    return this.watchItemsService.findOne(id, groupIds);
  }

  @Patch(':id/rate')
  @ApiOperation({ summary: 'Submeter avaliação do parceiro (apenas grupos Duo)' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  rate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() rateWatchItemDto: RateWatchItemDto,
  ) {
    const groupId = this.requireDuoGroupId(user);
    return this.watchItemsService.rate(id, rateWatchItemDto, groupId, user.groupTipo, user.profileId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um watch item (busca em todas as galerias do usuário)' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateWatchItemDto: UpdateWatchItemDto,
  ) {
    const groupIds = this.getUserGroupIds(user);
    return this.watchItemsService.update(
      id,
      updateWatchItemDto,
      groupIds,
      user.soloGroupId,
      user.groupTipo,
      user.profileId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um watch item (busca em todas as galerias do usuário)' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupIds = this.getUserGroupIds(user);
    return this.watchItemsService.remove(id, groupIds);
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  /**
   * Resolve qual groupId usar baseado no gallery param.
   * Solo → soloGroupId | Duo/padrão → groupId principal.
   */
  private resolveGalleryContext(
    user: AuthenticatedUser,
    gallery?: string,
  ): { groupId: string; effectiveTipo: GroupTipo | null } {
    if (gallery === 'solo') {
      const soloGroupId = user.soloGroupId ?? user.groupId;
      if (!soloGroupId) {
        throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
      }
      return { groupId: soloGroupId, effectiveTipo: GroupTipo.SOLO };
    }

    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
    }
    return { groupId: user.groupId, effectiveTipo: user.groupTipo };
  }

  /** IDs de todos os grupos do usuário (duo + solo). */
  private getUserGroupIds(user: AuthenticatedUser): string[] {
    const ids = new Set<string>();
    if (user.groupId) ids.add(user.groupId);
    if (user.soloGroupId) ids.add(user.soloGroupId);
    if (!ids.size) {
      throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
    }
    return [...ids];
  }

  /** Exige grupo duo ativo (match-pool, pending, rate). */
  private requireDuoGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
    }
    return user.groupId;
  }

}
