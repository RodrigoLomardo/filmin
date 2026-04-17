import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StatsService } from './stats.service';
import { RetroPeriod, RetrospectiveQueryDto } from './dto/retrospective-query.dto';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('retrospective')
  @ApiOperation({ summary: 'Retrospectiva do grupo por período' })
  @ApiQuery({ name: 'period', enum: RetroPeriod, required: false })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  getRetrospective(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RetrospectiveQueryDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.statsService.getRetrospective(groupId, query.period, user.groupTipo);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException('Complete o onboarding antes de usar este recurso.');
    }
    return user.groupId;
  }
}
