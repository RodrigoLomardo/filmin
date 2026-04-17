import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { BooksSearchQueryDto } from './dto/books-search-query.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar livros no Google Books por nome' })
  @ApiQuery({ name: 'query', example: 'Clean Code' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  search(@Query() query: BooksSearchQueryDto) {
    return this.booksService.search(query.query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um livro pelo Google Books ID' })
  @ApiParam({ name: 'id', example: 'jAUODAAAQBAJ' })
  findById(@Param('id') id: string) {
    return this.booksService.findById(id);
  }
}
