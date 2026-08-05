import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async find() {
    return await this.authorRepository.find();
  }

  create(data: CreateAuthorDto) {
    const author = this.authorRepository.create(data);
    return this.authorRepository.save(author);
  }
}
