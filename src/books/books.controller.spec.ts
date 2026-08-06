import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Language } from './entities/books.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

describe('BooksController', () => {
  let controller: BooksController;

  const booksService = {
    findBooks: jest.fn(),
    createBook: jest.fn(),
    findBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: booksService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return filtered books', async () => {
    const filter = { search: 'Dune', language: Language.ENGLISH };
    const books = [{ id: 1, title: 'Dune' }];
    booksService.findBooks.mockResolvedValue(books);

    await expect(controller.findAll(filter)).resolves.toEqual(books);
    expect(booksService.findBooks).toHaveBeenCalledWith(filter);
  });

  it('should create a book', async () => {
    const body = {
      title: 'Dune',
      authorId: 1,
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
    };
    const book = { id: 1, ...body };
    booksService.createBook.mockResolvedValue(book);

    await expect(controller.create(body)).resolves.toEqual(book);
    expect(booksService.createBook).toHaveBeenCalledWith(body);
  });

  it('should return one book by id', async () => {
    const book = { id: 4, title: 'Dune' };
    booksService.findBookById.mockResolvedValue(book);

    await expect(controller.findOne(4)).resolves.toEqual(book);
    expect(booksService.findBookById).toHaveBeenCalledWith(4);
  });

  it('should update a book', async () => {
    const body = { title: 'Dune Messiah' };
    const book = { id: 4, ...body };
    booksService.updateBook.mockResolvedValue(book);

    await expect(controller.update(4, body)).resolves.toEqual(book);
    expect(booksService.updateBook).toHaveBeenCalledWith(4, body);
  });

  it('should delete a book', async () => {
    const removed = { id: 4, title: 'Dune' };
    booksService.deleteBook.mockResolvedValue(removed);

    await expect(controller.delete('4')).resolves.toEqual(removed);
    expect(booksService.deleteBook).toHaveBeenCalledWith(4);
  });
});
