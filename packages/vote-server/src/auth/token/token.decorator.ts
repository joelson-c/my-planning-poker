import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Token = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request['token'];
    },
);

// Alias
export const AuthToken = Token;
