import { Controller, Body, Post } from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signUp(@Body() body: SignUpDto) {
        return this.authService.signUp(body)
    }

    @Post('signin')
    signIn(@Body() body: SignInDto) {
        return this.authService.signIn(body)
    }
}