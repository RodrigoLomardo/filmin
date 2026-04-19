import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileStatsDto } from './dto/profile-stats.dto';

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
}
