import {
  ConflictException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const authService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
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

  describe('/auth/signup (POST)', () => {
    it('should successfully register a new user with valid email and password', () => {
      authService.signUp.mockResolvedValue({ accessToken: 'token-1' });

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'johndoe@gmail.com', password: '12345678' })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.accessToken).toBe('token-1');
        });
    });

    it('should reject registration for an email that is already in use', () => {
      authService.signUp.mockRejectedValue(
        new ConflictException('Email already in use.'),
      );

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'johndoe@gmail.com', password: '12345678' })
        .expect(HttpStatus.CONFLICT);
    });

    it('should fail to register with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'invalidemail', password: '12345678' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail to register with a password that is too short', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'johndoe@example.com', password: '123' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/signin (POST)', () => {
    it('should successfully login user with valid credentials and return an access token', () => {
      authService.signIn.mockResolvedValue({ accessToken: 'token-2' });

      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'johndoe@gmail.com', password: '12345678' })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.accessToken).toBe('token-2');
        });
    });

    it('should deny access for invalid login credentials', () => {
      authService.signIn.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'johndoe@gmail.com', password: 'xxxxxxxxxxx' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
