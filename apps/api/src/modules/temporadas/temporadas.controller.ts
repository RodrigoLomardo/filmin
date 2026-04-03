import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { TemporadasService } from './temporadas.service';
import { CreateTemporadaDto } from './dto/create-temporada.dto';
import { UpdateTemporadaDto } from './dto/update-temporada.dto';

@ApiTags('temporadas')
@Controller('temporadas')
export class TemporadasController {
  constructor(private readonly temporadasService: TemporadasService) { }

  @Post()
  @ApiOperation({ summary: 'Criar uma temporada para uma série' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTemporadaDto: CreateTemporadaDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.temporadasService.create(createTemporadaDto, groupId, user.groupTipo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar temporadas' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    const groupId = this.requireGroupId(user);
    return this.temporadasService.findAll(groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma temporada por id' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupId = this.requireGroupId(user);
    return this.temporadasService.findOne(id, groupId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma temporada' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateTemporadaDto: UpdateTemporadaDto,
  ) {
    const groupId = this.requireGroupId(user);
    return this.temporadasService.update(id, updateTemporadaDto, groupId, user.groupTipo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma temporada' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const groupId = this.requireGroupId(user);
    return this.temporadasService.remove(id, groupId);
  }

  private requireGroupId(user: AuthenticatedUser): string {
    if (!user.groupId) {
      throw new ForbiddenException(
        'Complete o onboarding antes de usar este recurso.',
      );
    }
    return user.groupId;
  }
}
