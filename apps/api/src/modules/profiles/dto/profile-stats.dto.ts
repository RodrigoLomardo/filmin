import { ApiProperty } from '@nestjs/swagger';

export class ProfileStatsDto {
  @ApiProperty({ description: 'Filmes marcados como assistido' })
  filmes: number;

  @ApiProperty({ description: 'Séries marcadas como assistida' })
  series: number;

  @ApiProperty({ description: 'Livros marcados como lido' })
  livros: number;
}
