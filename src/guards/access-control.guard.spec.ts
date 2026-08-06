import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlGuard } from './access-control.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('AccessControlGuard', () => {
  let guard: AccessControlGuard;

  const reflector = {
    getAllAndOverride: jest.fn(),
  };

  const context = (role: string) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    } as unknown as ExecutionContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessControlGuard,
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<AccessControlGuard>(AccessControlGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(context('viewer'))).toBe(true);
  });

  it('should allow access for matching roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(guard.canActivate(context('admin'))).toBe(true);
  });

  it('should deny access for non-matching roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(guard.canActivate(context('viewer'))).toBe(false);
  });
});
