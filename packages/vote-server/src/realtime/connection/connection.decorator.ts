import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Connection = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request['connectionToken'];
    },
);

export const Conn = Connection;
