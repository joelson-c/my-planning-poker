import { Body, Controller, Post } from '@nestjs/common';
import { LoginAnonymousDto } from './login/login-anonymous.dto';
import { AuthService } from './auth.service';
import { Public } from './public/public.decorator';
import { AuthToken } from './token/token.decorator';
import { Token } from './token/token.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login-anonymous')
    async loginAnonymous(@Body() { nickname }: LoginAnonymousDto) {
        return {
            token: await this.authService.getTokenForAnonymousLogin(nickname),
        };
    }

    @Post('revalidate')
    async revalidate(@AuthToken() token: Token) {
        return {
            token: await this.authService.revalidateToken(token),
        };
    }
}
