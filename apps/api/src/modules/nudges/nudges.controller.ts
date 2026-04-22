import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NudgesService } from './nudges.service';

@ApiTags('nudges')
@Controller('nudges')
export class NudgesController {
  constructor(private readonly nudgesService: NudgesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista nudges não lidos do grupo. Avalia e cria novos se necessário.' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    await this.nudgesService.evaluateAndCreate(groupId);
    return this.nudgesService.findUnread(groupId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca um nudge como lido' })
  @ApiParam({ name: 'id', description: 'ID do nudge' })
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupId = this.requireGroupId(user);
    await this.nudgesService.markAsRead(id, groupId);
    return { ok: true };
  }

  @Delete('read-all')
  @ApiOperation({ summary: 'Marca todos os nudges do grupo como lidos' })
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    await this.nudgesService.markAllRead(groupId);
    return { ok: true };
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar os nudges.');
    }
    return user.groupId;
  }
}
