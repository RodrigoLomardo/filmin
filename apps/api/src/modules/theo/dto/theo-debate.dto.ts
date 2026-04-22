import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class TheoDebateDto {
  @ApiProperty({ description: 'ID do primeiro item (A) para o debate' })
  @IsUUID()
  @IsNotEmpty()
  itemAId: string;

  @ApiProperty({ description: 'ID do segundo item (B) para o debate' })
  @IsUUID()
  @IsNotEmpty()
  itemBId: string;

  @ApiPropertyOptional({ description: 'ID da sessão de conversa' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  sessionId?: string;
}

export interface TheoDebateResponse {
  itemA: DebateItem;
  itemB: DebateItem;
  argumentsForA: string[];
  argumentsForB: string[];
  verdict: string;
  winner: 'A' | 'B' | 'tie';
}

export interface DebateItem {
  id: string;
  titulo: string;
  posterUrl: string | null;
  anoLancamento: number | null;
  generos: string[];
  notaGeral: number | null;
}
