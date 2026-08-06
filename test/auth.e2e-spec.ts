import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import  request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    }));
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.dropDatabase()
    app.close()
  })

  describe('/auth/signup (POST)', () => {
    it('should successfully register a new user with valid email and password', () => {
      return request(app.getHttpServer())
        .post("/auth/signup")
        .send({ email: "johndoe@gmail.com", password: "12345678" })
        .expect(HttpStatus.CREATED)
    })

    it('should reject registration for an email that is already in use', () => {
      return request(app.getHttpServer())
      .post("/auth/signup")
      .send({ email: "johndoe@gmail.com", password: "12345678" })
      .expect(HttpStatus.CONFLICT)
      .expect((res) => {
        expect(res.body.message).toBe("Email already in use")
      })
    })

    it('should fail to register with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'invalidemail', password: '12345678' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail to register with a password that is too short', () => {
      return request(app.getHttpServer())
        .post("/auth/signup")
        .send({ email: "johndoe@example.com", password: "123" })
        .expect(HttpStatus.BAD_REQUEST);
    });

  })

  describe('/auth/signin (POST)', () => {
    it('should successfully login user with valid credentials and return an access token', () => {
      return request(app.getHttpServer())
        .post("/auth/signin")
        .send({ email: "johndoe@gmail.com", password: "12345678" })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.accessToken).toEqual(expect.any(String))
      })
    })

    it('should deny access for invalid login credentials', () => {
      return request(app.getHttpServer())
        .post("/auth/signin")
        .send({ email: "johndoe@gmail.com", password: "xxxxxxxxxxx" })
        .expect(HttpStatus.UNAUTHORIZED)
    });
  })


});