import { UpdateBookDto } from './dtos/update-book.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from './entities/books.entity';
import { Author } from '../authors/entities/author.entity';
import { CreateBookDto } from './dtos/create-book.dto';
import { GetBookFilterDto } from './dtos/get-book-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PostgreSQLErrorCode from 'src/postgresql-error-codes';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  async findBooks(filterDto: GetBookFilterDto) {
    const { search, publication_date: publicationDate, language } = filterDto;

    const query = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author');

    if (search) {
      query.andWhere('(book.title LIKE :search OR author.name LIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (publicationDate) {
      query.andWhere('book.publicationDate = :publicationDate', {
        publicationDate,
      });
    }

    if (language) {
      query.andWhere('book.language = :language', { language });
    }

    const books = await query.getMany();
    return books;
  }

  async findBookById(id: number) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async createBook(data: CreateBookDto) {
    const book = this.bookRepository.create({
      ...data,
      author: {
        id: data.authorId,
      },
    });

    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      const postgresError = error as { code?: string };
      if (postgresError.code === PostgreSQLErrorCode.ForeignKeyViolation) {
        throw new NotFoundException(
          `Author with id ${data.authorId} doesn't exist`,
        );
      }
      throw error;
    }
  }

  async updateBook(id: number, data: UpdateBookDto) {
    const { authorId, ...rest } = data;

    try {
      const book = await this.bookRepository.findOneBy({ id });

      if (!book) {
        throw new NotFoundException(`Book with id ${id} not found`);
      }

      Object.assign(book, rest);

      if (typeof authorId === 'number') {
        const author = new Author();
        author.id = authorId;
        book.author = author;
      }

      return await this.bookRepository.save(book);
    } catch (error) {
      const postgresError = error as { code?: string };
      if (postgresError.code === PostgreSQLErrorCode.ForeignKeyViolation) {
        throw new NotFoundException(`Author with id ${authorId} doesn't exist`);
      }
      throw error;
    }
  }

  async deleteBook(id: number) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return this.bookRepository.remove(book);
  }
}
