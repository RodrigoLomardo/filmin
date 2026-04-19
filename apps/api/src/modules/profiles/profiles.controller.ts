import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileStatsDto } from './dto/profile-stats.dto';
import { PublicProfileDto } from './dto/public-profile.dto';
import { SearchProfileResultDto } from './dto/search-profile.dto';
import { ProfileViewersResponseDto } from './dto/profile-viewers.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.findById(user.profileId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza nome, sobrenome, gênero e privacidade do perfil' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user.profileId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retorna contagem de filmes, séries e livros assistidos do usuário' })
  getStats(@CurrentUser() user: AuthenticatedUser): Promise<ProfileStatsDto> {
    return this.profilesService.getStats(user.profileId);
  }

  @Get('me/viewers')
  @ApiOperation({ summary: 'Retorna lista de usuários que visualizaram o perfil' })
  getMyViewers(@CurrentUser() user: AuthenticatedUser): Promise<ProfileViewersResponseDto> {
    return this.profilesService.getMyViewers(user.profileId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca perfis pelo nome ou email' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo de busca (mín. 2 caracteres)' })
  search(
    @Query('q') q: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SearchProfileResultDto[]> {
    return this.profilesService.searchProfiles(q ?? '', user.profileId);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Retorna perfil público de outro usuário e registra visualização' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  getPublicProfile(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PublicProfileDto> {
    return this.profilesService.getPublicProfile(id, user.profileId);
  }
}
