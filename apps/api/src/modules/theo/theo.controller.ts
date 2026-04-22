import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { TheoQueryDto } from './dto/theo-query.dto';
import { TheoDebateDto } from './dto/theo-debate.dto';
import { TheoService } from './theo.service';
import { TheoMemoryService } from './theo-memory.service';
import { TheoDebateService } from './theo-debate.service';

@ApiTags('theo')
@Controller('theo')
export class TheoController {
  constructor(
    private readonly theoService: TheoService,
    private readonly memoryService: TheoMemoryService,
    private readonly debateService: TheoDebateService,
  ) {}

  @Post('query')
  @ApiOperation({ summary: 'Envia mensagem ao Theo e recebe resposta orquestrada via IA' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  query(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TheoQueryDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.theoService.query(dto, groupId, user.groupTipo, user.email);
  }

  @Post('debate')
  @ApiOperation({ summary: 'Theo debate dois itens e recomenda qual assistir' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  debate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TheoDebateDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.debateService.debate(dto.itemAId, dto.itemBId, groupId);
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: 'Reseta a memória de uma sessão do Theo' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão a ser resetada' })
  resetSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ) {
    const groupId = this.requireGroupId(user);
    return this.memoryService.reset(groupId, sessionId);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar o Theo.');
    }
    return user.groupId;
  }
}
