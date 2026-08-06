import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { Book, Language } from './entities/books.entity';
import { Author } from '../authors/entities/author.entity';
import { NotFoundException } from '@nestjs/common';
import PostgreSQLErrorCode from '../postgresql-error-codes';

type BookRepositoryMock = {
  createQueryBuilder: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: BookRepositoryMock;

  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get(getRepositoryToken(Book)) as BookRepositoryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should query books with filters', async () => {
    const books = [{ id: 1, title: 'Dune' }];
    queryBuilder.getMany.mockResolvedValue(books);

    await expect(
      service.findBooks({
        search: 'Dune',
        publication_date: '1965-08-01',
        language: Language.ENGLISH,
      }),
    ).resolves.toEqual(books);

    expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'book.author',
      'author',
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      '(book.title LIKE :search OR author.name LIKE :search)',
      { search: '%Dune%' },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'book.publicationDate = :publicationDate',
      { publicationDate: '1965-08-01' },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      'book.language = :language',
      { language: Language.ENGLISH },
    );
  });

  it('should return a book by id', async () => {
    const book = { id: 1, title: 'Dune' } as Book;
    bookRepository.findOneBy.mockResolvedValue(book);

    await expect(service.findBookById(1)).resolves.toEqual(book);
  });

  it('should throw when a book is missing', async () => {
    bookRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findBookById(1)).rejects.toThrow(NotFoundException);
  });

  it('should create a book with the author relation', async () => {
    const data = {
      title: 'Dune',
      authorId: 1,
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
    };
    const book = { id: 1, ...data };
    bookRepository.create.mockReturnValue(book);
    bookRepository.save.mockResolvedValue(book);

    await expect(service.createBook(data)).resolves.toEqual(book);
    expect(bookRepository.create).toHaveBeenCalledWith({
      ...data,
      author: { id: 1 },
    });
    expect(bookRepository.save).toHaveBeenCalledWith(book);
  });

  it('should translate foreign key failures when creating a book', async () => {
    const data = {
      title: 'Dune',
      authorId: 99,
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
    };
    bookRepository.create.mockReturnValue(data);
    bookRepository.save.mockRejectedValue({
      code: PostgreSQLErrorCode.ForeignKeyViolation,
    });

    await expect(service.createBook(data)).rejects.toThrow(
      "Author with id 99 doesn't exist",
    );
  });

  it('should update a book', async () => {
    const book = {
      id: 1,
      title: 'Dune',
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
      author: { id: 1 } as Author,
    } as Book;
    bookRepository.findOneBy.mockResolvedValue(book);
    bookRepository.save.mockResolvedValue(book);

    const updated = await service.updateBook(1, {
      title: 'Dune Messiah',
      authorId: 2,
    });

    expect(updated.title).toBe('Dune Messiah');
    expect(updated.author.id).toBe(2);
    expect(bookRepository.save).toHaveBeenCalledWith(book);
  });

  it('should throw when updating a missing book', async () => {
    bookRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateBook(1, { title: 'Dune Messiah' }),
    ).rejects.toThrow('Book with id 1 not found');
  });

  it('should translate foreign key failures when updating a book', async () => {
    const book = {
      id: 1,
      title: 'Dune',
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
      author: { id: 1 } as Author,
    } as Book;
    bookRepository.findOneBy.mockResolvedValue(book);
    bookRepository.save.mockRejectedValue({
      code: PostgreSQLErrorCode.ForeignKeyViolation,
    });

    await expect(
      service.updateBook(1, { title: 'Dune Messiah', authorId: 99 }),
    ).rejects.toThrow("Author with id 99 doesn't exist");
  });

  it('should delete a book', async () => {
    const book = { id: 1, title: 'Dune' } as Book;
    bookRepository.findOneBy.mockResolvedValue(book);
    bookRepository.remove.mockResolvedValue(book);

    await expect(service.deleteBook(1)).resolves.toEqual(book);
    expect(bookRepository.remove).toHaveBeenCalledWith(book);
  });

  it('should throw when deleting a missing book', async () => {
    bookRepository.findOneBy.mockResolvedValue(null);

    await expect(service.deleteBook(1)).rejects.toThrow(
      'Book with id 1 not found',
    );
  });
});
