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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { GetBookFilterDto } from './dtos/get-book-filter.dto';
import { LanguageValidationPipe } from 'src/common/pipes/language-validation/language-validation.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/auth/entities/user.entity';
import { AccessControlGuard } from 'src/guards/accesscontrol.guard';

@UseGuards(AuthGuard, AccessControlGuard)
@Roles(Role.Viewer)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: GetBookFilterDto) {
    return this.booksService.findBooks(query);
  }

  @Post()
  @Roles(Role.Admin)
  @UsePipes(LanguageValidationPipe)
  createBook(@Body() body: CreateBookDto) {
    return this.booksService.createBook(body);
  }

  @Get(':id')
  findBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findBookById(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
  ) {
    return this.booksService.updateBook(id, body);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteBook(id);
  }
}
