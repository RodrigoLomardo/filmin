import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TheoTranscribeDto {
  @ApiProperty({ description: 'Áudio em base64' })
  @IsString()
  @IsNotEmpty()
  audio: string;

  @ApiProperty({ description: 'MIME type do áudio (ex: audio/webm)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  mimeType: string;
}
