import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * Retorna o grupo atual do usuário com membros e profiles.
   * Retorna null se o usuário ainda não passou pelo onboarding.
   * Usado pelo frontend para decidir qual tela exibir após o login.
   */
  @Get('me')
  @ApiOperation({ summary: 'Retorna o grupo atual do usuário autenticado' })
  getMyGroup(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.getMyGroup(user.profileId);
  }

  /**
   * Cria um grupo solo para o usuário.
   * O usuário passa a ter acesso ao app e ver seus próprios watch items.
   */
  @Post('solo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um grupo solo para o usuário autenticado' })
  createSolo(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.createSolo(user.profileId);
  }

  /**
   * Cria um grupo duo para o usuário, gerando um invite_code.
   * O segundo membro pode entrar via POST /groups/join/:inviteCode.
   */
  @Post('duo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um grupo duo com invite_code para o usuário autenticado' })
  createDuo(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.createDuo(user.profileId);
  }

  /**
   * Entra em um grupo duo existente usando o invite_code.
   * Acessível a usuários autenticados que ainda não pertencem a nenhum grupo.
   * Regras:
   *  - invite_code deve ser válido e pertencer a um grupo duo
   *  - grupo não pode ter 2 membros já
   *  - usuário não pode já ter um grupo
   */
  @Post('join/:inviteCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Entra em um grupo duo via invite_code' })
  @ApiParam({ name: 'inviteCode', example: 'aB3dEfGhIjK' })
  joinByInviteCode(
    @CurrentUser() user: AuthenticatedUser,
    @Param('inviteCode') inviteCode: string,
  ) {
    return this.groupsService.joinByInviteCode(user.profileId, inviteCode);
  }
}
