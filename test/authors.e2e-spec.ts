import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthorsController } from '../src/authors/authors.controller';
import { AuthorsService } from '../src/authors/authors.service';

describe('AuthorsController (e2e)', () => {
  let app: INestApplication;

  const authorsService = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [{ provide: AuthorsService, useValue: authorsService }],
    }).compile();

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

  it('/authors (GET)', () => {
    authorsService.find.mockResolvedValue([{ id: 1, name: 'Haruki Murakami' }]);

    return request(app.getHttpServer())
      .get('/authors')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([{ id: 1, name: 'Haruki Murakami' }]);
      });
  });

  it('/authors (POST)', () => {
    authorsService.create.mockResolvedValue({ id: 2, name: 'Kazuo Ishiguro' });

    return request(app.getHttpServer())
      .post('/authors')
      .send({ name: 'Kazuo Ishiguro' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ id: 2, name: 'Kazuo Ishiguro' });
      });
  });

  it('/authors (POST) should reject invalid payloads', () => {
    return request(app.getHttpServer()).post('/authors').send({}).expect(400);
  });
});
