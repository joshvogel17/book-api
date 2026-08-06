import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const createContext = (authorization?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization } }),
      }),
    } as unknown as ExecutionContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should attach the decoded user to the request', async () => {
    const payload = { id: 1, email: 'test@example.com', role: 'admin' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const request = { headers: { authorization: 'Bearer token' } } as {
      headers: { authorization: string };
      user?: typeof payload;
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'test-secret',
    });
    expect(request.user).toEqual(payload);
  });

  it('should throw when the token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      guard.canActivate(createContext('Bearer invalid')),
    ).rejects.toThrow(UnauthorizedException);
  });
});
