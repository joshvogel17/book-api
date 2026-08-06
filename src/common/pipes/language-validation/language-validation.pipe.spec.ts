import { LanguageValidationPipe } from './language-validation.pipe';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { Language } from '../../../books/entities/books.entity';

describe('LanguageValidationPipe', () => {
  const pipe = new LanguageValidationPipe();
  const metadata = {} as ArgumentMetadata;

  it('should return supported languages', () => {
    const value = {
      title: 'Dune',
      authorId: 1,
      publicationDate: '1965-08-01',
      numberOfPages: 412,
      language: Language.ENGLISH,
    };

    expect(pipe.transform(value, metadata)).toBe(value);
  });

  it('should reject unsupported languages', () => {
    expect(() =>
      pipe.transform(
        {
          title: 'Dune',
          authorId: 1,
          publicationDate: '1965-08-01',
          numberOfPages: 412,
          language: 'es' as Language,
        },
        metadata,
      ),
    ).toThrow(BadRequestException);
  });
});
