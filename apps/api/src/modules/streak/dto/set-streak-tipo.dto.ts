import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StreakTipo } from '../../../common/enums/streak-tipo.enum';

export class SetStreakTipoDto {
  @ApiProperty({ enum: StreakTipo, example: StreakTipo.DAILY })
  @IsEnum(StreakTipo)
  tipo: StreakTipo;
}
