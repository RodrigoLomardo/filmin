import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TmdbTipo {
  FILME = 'filme',
  SERIE = 'serie',
}

export class TmdbSearchQueryDto {
  @ApiProperty({ example: 'Inception' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  query: string;

  @ApiProperty({ enum: TmdbTipo, example: TmdbTipo.FILME })
  @IsEnum(TmdbTipo)
  tipo: TmdbTipo;
}
