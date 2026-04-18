import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * Retorna o grupo primário do usuário (duo quando em duo, solo quando solo-only).
   * Inclui `soloGroupId` para roteamento da galeria solo.
   */
  @Get('me')
  @ApiOperation({ summary: 'Retorna o grupo atual do usuário autenticado com soloGroupId' })
  getMyGroup(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.getMyGroup(user.profileId);
  }

  @Post('solo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um grupo solo para o usuário autenticado (onboarding)' })
  createSolo(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.createSolo(user.profileId);
  }

  @Post('duo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um grupo duo com invite_code e garante grupo solo para o usuário' })
  createDuo(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.createDuo(user.profileId);
  }

  @Post('join/:inviteCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Entra em um grupo duo via invite_code (mantém ou cria grupo solo)' })
  @ApiParam({ name: 'inviteCode', example: 'aB3dEfGhIjK' })
  joinByInviteCode(
    @CurrentUser() user: AuthenticatedUser,
    @Param('inviteCode') inviteCode: string,
  ) {
    return this.groupsService.joinByInviteCode(user.profileId, inviteCode);
  }

  /**
   * Sai do grupo duo.
   * Migra todos os itens compartilhados para a galeria solo de ambos os membros.
   * Operação transacional — sem perda de histórico.
   */
  @Post('leave-duo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sai do grupo duo e migra itens compartilhados para galeria solo' })
  async leaveDuo(@CurrentUser() user: AuthenticatedUser) {
    if (!user.groupId || user.groupTipo !== GroupTipo.DUO) {
      throw new BadRequestException('Você não está em um grupo duo.');
    }

    if (!user.soloGroupId) {
      throw new ForbiddenException(
        'Galeria solo não encontrada. Entre em contato com o suporte.',
      );
    }

    await this.groupsService.leaveDuo(user.profileId, user.groupId, user.soloGroupId);
    return { message: 'Você saiu do grupo duo. Seus itens foram preservados na galeria solo.' };
  }
}
