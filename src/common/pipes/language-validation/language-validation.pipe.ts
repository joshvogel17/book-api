import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateBookDto } from '../../../books/dtos/create-book.dto';
import { Language } from '../../../books/entities/books.entity';

@Injectable()
export class LanguageValidationPipe implements PipeTransform {
  transform(value: CreateBookDto, metadata: ArgumentMetadata) {
    void metadata;
    const language = value.language;
    const supportedLanguages = [Language.ENGLISH, Language.FRENCH];
    if (!supportedLanguages.includes(language)) {
      throw new BadRequestException('Unsupported Language');
    }
    return value;
  }
}
