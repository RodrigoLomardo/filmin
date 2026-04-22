import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { WatchItemTipo } from '../../../common/enums/watch-item-tipo.enum';

export class TheoQueryDto {
  @ApiProperty({ description: 'Mensagem do usuário para o Theo' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Filtro de tipo explícito (complementa o parser de intenção)',
    enum: WatchItemTipo,
  })
  @IsEnum(WatchItemTipo)
  @IsOptional()
  tipoFilter?: WatchItemTipo;

  @ApiPropertyOptional({
    description: 'ID da sessão de conversa (gerado pelo frontend)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  sessionId?: string;
}
