import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WatchItemStatus } from '../../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../../common/enums/watch-item-tipo.enum';

export class CreateWatchItemDto {
  @ApiProperty({ example: 'Interestelar' })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @ApiPropertyOptional({ example: 'Interstellar' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tituloOriginal?: string;

  @ApiPropertyOptional({ example: 2014 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1888)
  @Max(2100)
  anoLancamento?: number;

  @ApiProperty({ enum: WatchItemTipo, example: WatchItemTipo.FILME })
  @IsEnum(WatchItemTipo)
  tipo: WatchItemTipo;

  @ApiProperty({ enum: WatchItemStatus, example: WatchItemStatus.ASSISTIDO })
  @IsEnum(WatchItemStatus)
  status: WatchItemStatus;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  notaDele?: number;

  @ApiPropertyOptional({ example: 9.0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  notaDela?: number;

  @ApiPropertyOptional({ example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  dataAssistida?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rewatchCount?: number;

  @ApiPropertyOptional({ example: 'Excelente filme' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiProperty({
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  generosIds: string[];
}