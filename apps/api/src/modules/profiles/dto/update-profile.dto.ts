import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GeneroUsuario } from '../../../common/enums/genero-usuario.enum';

export class UpdateProfileDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ enum: GeneroUsuario })
  @IsOptional()
  @IsEnum(GeneroUsuario)
  genero?: GeneroUsuario;

  @ApiPropertyOptional({ description: 'Torna o perfil privado (apenas o dono acessa)' })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
