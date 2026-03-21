import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GenerosService } from './generos.service';

@ApiTags('generos')
@Controller('generos')
export class GenerosController {
  constructor(private readonly generosService: GenerosService) { }

  @Get()
  @ApiOperation({ summary: 'Listar gêneros' })
  findAll() {
    return this.generosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar gênero por id' })
  @ApiParam({ name: 'id', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  async findOne(@Param('id') id: string) {
    const genero = await this.generosService.findOne(id);

    if (!genero) {
      throw new NotFoundException(`Gênero com id "${id}" não encontrado.`);
    }

    return genero;
  }
}