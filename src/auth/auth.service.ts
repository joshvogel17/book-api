import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import { hash, genSalt, compare } from 'bcrypt';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpDto) {
    try {
      const { email, password } = signUpData;
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);

      const accessToken = await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      return { accessToken };
    } catch (error) {
      console.log(error.code);
      if (error.code === '23505') {
        // "23505" is a unique constraint violation in PostgreSQL.
        throw new ConflictException('Email already in use.');
      }
      throw error;
    }
  }

  async signIn(signInData: SignInDto) {
    const { email, password } = signInData;
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        throw new Error('Password incorrect');
      }

      // ToDo: return JWT.
      const accessToken = await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      return { accessToken };
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
