import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class RateWatchItemDto {
  @ApiProperty({ example: 8.5, description: 'Nota do parceiro (0–10)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  nota: number;
}
