import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { GetBookFilterDto } from './dtos/get-book-filter.dto';
import { LanguageValidationPipe } from 'src/common/pipes/language-validation/language-validation.pipe';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: GetBookFilterDto) {
    return this.booksService.findBooks(query);
  }

  @Post()
  @UsePipes(LanguageValidationPipe)
  createBook(@Body() body: CreateBookDto) {
    return this.booksService.createBook(body);
  }

  @Get(':id')
  findBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findBookById(id);
  }

  @Patch(':id')
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
  ) {
    return this.booksService.updateBook(id, body);
  }

  @Delete(':id')
  deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteBook(id);
  }
}
