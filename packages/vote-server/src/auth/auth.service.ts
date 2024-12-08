import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Token } from './token/token.interface';
import { AuthToken } from './auth.decorator';

@Injectable()
export class AuthService {
    private readonly issuer = 'voting_server';
    private readonly audience = 'anon_login';

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async getTokenForAnonymousLogin(nickname: string) {
        const user = await this.userService.createAnonymous(nickname);
        return this.jwtService.signAsync({
            sub: user.id,
            iss: this.issuer,
            aud: this.audience,
            nickname: nickname,
        });
    }

    async revalidateToken(@AuthToken() token: Token) {
        await this.userService.refreshUser(token.sub);
        const newToken = { ...token };
        delete newToken['exp'];
        delete newToken['iat'];

        return this.jwtService.signAsync({
            ...newToken,
        });
    }
}
