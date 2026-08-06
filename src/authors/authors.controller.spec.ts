import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  const authorsService = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [{ provide: AuthorsService, useValue: authorsService }],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all authors', async () => {
    const authors = [{ id: 1, name: 'Gabriel Garcia Marquez' }];
    authorsService.find.mockResolvedValue(authors);

    await expect(controller.findAll()).resolves.toEqual(authors);
    expect(authorsService.find).toHaveBeenCalledTimes(1);
  });

  it('should create an author', async () => {
    const data = { name: 'Isabel Allende' };
    const author = { id: 2, ...data };
    authorsService.create.mockResolvedValue(author);

    await expect(controller.create(data)).resolves.toEqual(author);
    expect(authorsService.create).toHaveBeenCalledWith(data);
  });
});
