import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import { AuthGuard } from '../src/guards/auth.guard';
import { AccessControlGuard } from '../src/guards/access-control.guard';
import { Language } from '../src/books/entities/books.entity';

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  const booksService = {
    findBooks: jest.fn(),
    createBook: jest.fn(),
    findBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: booksService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AccessControlGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('/books (GET)', () => {
    booksService.findBooks.mockResolvedValue([{ id: 1, title: 'Dune' }]);

    return request(app.getHttpServer())
      .get('/books')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([{ id: 1, title: 'Dune' }]);
      });
  });

  it('/books (POST)', () => {
    booksService.createBook.mockResolvedValue({
      id: 1,
      title: 'Dune',
      authorId: 10,
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
    });

    return request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Dune',
        authorId: 10,
        publicationDate: '1965-08-01',
        numberOfPages: 412,
        language: Language.ENGLISH,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('Dune');
      });
  });

  it('/books/:id (GET)', () => {
    booksService.findBookById.mockResolvedValue({ id: 1, title: 'Dune' });

    return request(app.getHttpServer())
      .get('/books/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ id: 1, title: 'Dune' });
      });
  });

  it('/books/:id (PATCH)', () => {
    booksService.updateBook.mockResolvedValue({ id: 1, title: 'Dune Messiah' });

    return request(app.getHttpServer())
      .patch('/books/1')
      .send({ title: 'Dune Messiah' })
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe('Dune Messiah');
      });
  });

  it('/books/:id (DELETE)', () => {
    booksService.deleteBook.mockResolvedValue({ id: 1, title: 'Dune' });

    return request(app.getHttpServer())
      .delete('/books/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ id: 1, title: 'Dune' });
      });
  });
});
