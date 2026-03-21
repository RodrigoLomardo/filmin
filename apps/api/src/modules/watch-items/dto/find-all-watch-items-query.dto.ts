import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { WatchItemStatus } from '../../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../../common/enums/watch-item-tipo.enum';

export class FindAllWatchItemsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(WatchItemTipo)
  tipo?: WatchItemTipo;

  @IsOptional()
  @IsEnum(WatchItemStatus)
  status?: WatchItemStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['titulo', 'notaGeral', 'dataAssistida', 'createdAt', 'anoLancamento'])
  sortBy?: 'titulo' | 'notaGeral' | 'dataAssistida' | 'createdAt' | 'anoLancamento' = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}