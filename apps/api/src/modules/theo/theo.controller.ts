import { Body, Controller, ForbiddenException, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { TheoQueryDto } from './dto/theo-query.dto';
import { TheoService } from './theo.service';

@ApiTags('theo')
@Controller('theo')
export class TheoController {
  constructor(private readonly theoService: TheoService) {}

  @Post('query')
  @ApiOperation({ summary: 'Envia mensagem ao Theo e recebe resposta orquestrada via IA' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  query(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TheoQueryDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.theoService.query(dto, groupId, user.groupTipo);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar o Theo.');
    }
    return user.groupId;
  }
}
