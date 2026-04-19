import { Controller, Get, Post, Param, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Public } from '../auth/decorators/public.decorator';
import { AchievementsService } from './achievements.service';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todas as conquistas com status (locked/unlocked + progresso)' })
  async getAll(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    const [achievements, progress] = await Promise.all([
      this.achievementsService.getAll(groupId, user.groupTipo),
      this.achievementsService.getProgress(groupId, user.groupTipo),
    ]);

    return achievements.map((a) => ({
      ...a,
      progress: !a.unlocked ? progress.get(a.slug) : undefined,
    }));
  }

  @Post('check')
  @ApiOperation({ summary: 'Recalcula conquistas e retorna as recém-desbloqueadas (delta)' })
  check(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    return this.achievementsService.check(groupId, user.groupTipo);
  }

  @Get('public/:profileId')
  @Public()
  @ApiOperation({ summary: 'Retorna conquistas desbloqueadas de um perfil público' })
  @ApiParam({ name: 'profileId', description: 'ID do perfil' })
  async getPublic(@Param('profileId') profileId: string) {
    return this.achievementsService.getUnlockedForGroupByProfileId(profileId);
  }

  @Get('leaderboard/:levelGroup')
  @Public()
  @ApiOperation({ summary: 'Top 10 grupos por categoria de conquista' })
  @ApiParam({ name: 'levelGroup', description: 'Categoria: cinefilo | maratonista | leitor_avido | colecionador | alma_gemea' })
  async getLeaderboard(@Param('levelGroup') levelGroup: string) {
    const valid = ['cinefilo', 'maratonista', 'leitor_avido', 'colecionador', 'alma_gemea'];
    if (!valid.includes(levelGroup)) throw new BadRequestException('Categoria inválida');
    return this.achievementsService.getLeaderboard(levelGroup);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) throw new Error('Usuário sem grupo');
    return user.groupId;
  }
}
