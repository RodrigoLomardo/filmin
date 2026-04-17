import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class BooksSearchQueryDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  query: string;
}
