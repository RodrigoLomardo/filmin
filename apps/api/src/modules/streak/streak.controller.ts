import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StreakService } from './streak.service';
import { SetStreakTipoDto } from './dto/set-streak-tipo.dto';

@ApiTags('streak')
@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar streak do grupo atual' })
  getMyStreak(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    return this.streakService.getOrCreate(groupId);
  }

  @Patch('tipo')
  @ApiOperation({ summary: 'Alterar tipo do streak (reset obrigatório)' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  setTipo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetStreakTipoDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.streakService.setTipo(groupId, dto.tipo);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
    }
    return user.groupId;
  }
}
