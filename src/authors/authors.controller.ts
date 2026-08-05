import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dtos/create-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  findAll() {
    return this.authorsService.find();
  }

  @Post()
  create(@Body() data: CreateAuthorDto) {
    return this.authorsService.create(data);
  }
}
