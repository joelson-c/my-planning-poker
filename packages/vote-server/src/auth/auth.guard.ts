import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Token } from './token/token.interface';
import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public/public.decorator';
import { UserService } from 'src/user/user.service';

export
@Injectable()
class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        const tokenPayload = await this.parseToken(token);
        const user = this.userService.getByToken(tokenPayload);
        if (!user) {
            throw new UnauthorizedException();
        }

        request['token'] = tokenPayload;
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async parseToken(token: string) {
        try {
            return await this.jwtService.verifyAsync<Token>(token);
        } catch {
            throw new UnauthorizedException();
        }
    }
}
