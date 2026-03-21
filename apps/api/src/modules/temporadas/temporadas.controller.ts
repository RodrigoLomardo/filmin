import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
  create(@Body() createTemporadaDto: CreateTemporadaDto) {
    return this.temporadasService.create(createTemporadaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar temporadas' })
  findAll() {
    return this.temporadasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma temporada por id' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  findOne(@Param('id') id: string) {
    return this.temporadasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma temporada' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateTemporadaDto: UpdateTemporadaDto,
  ) {
    return this.temporadasService.update(id, updateTemporadaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma temporada' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  remove(@Param('id') id: string) {
    return this.temporadasService.remove(id);
  }
}