import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RetroPeriod {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
}

export class RetrospectiveQueryDto {
  @ApiPropertyOptional({ enum: RetroPeriod, default: RetroPeriod.MONTH })
  @IsEnum(RetroPeriod)
  @IsOptional()
  period: RetroPeriod = RetroPeriod.MONTH;
}
