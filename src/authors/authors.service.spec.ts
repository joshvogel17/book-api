import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';

type AuthorRepositoryMock = {
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

describe('AuthorsService', () => {
  let service: AuthorsService;
  let authorRepository: AuthorRepositoryMock;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getRepositoryToken(Author), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    authorRepository = module.get(
      getRepositoryToken(Author),
    ) as AuthorRepositoryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all authors', async () => {
    const authors = [{ id: 1, name: 'Toni Morrison' }];
    authorRepository.find.mockResolvedValue(authors);

    await expect(service.find()).resolves.toEqual(authors);
    expect(authorRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should create and save an author', async () => {
    const data = { name: 'Octavia Butler' };
    const author = { id: 3, ...data };
    authorRepository.create.mockReturnValue(author);
    authorRepository.save.mockResolvedValue(author);

    await expect(service.create(data)).resolves.toEqual(author);
    expect(authorRepository.create).toHaveBeenCalledWith(data);
    expect(authorRepository.save).toHaveBeenCalledWith(author);
  });
});
