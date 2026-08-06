import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign up a user', async () => {
    const body = { email: 'test@example.com', password: 'password123' };
    const result = { accessToken: 'token-1' };
    authService.signUp.mockResolvedValue(result);

    await expect(controller.signUp(body)).resolves.toEqual(result);
    expect(authService.signUp).toHaveBeenCalledWith(body);
  });

  it('should sign in a user', async () => {
    const body = { email: 'test@example.com', password: 'password123' };
    const result = { accessToken: 'token-2' };
    authService.signIn.mockResolvedValue(result);

    await expect(controller.signIn(body)).resolves.toEqual(result);
    expect(authService.signIn).toHaveBeenCalledWith(body);
  });
});
