import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { REALTIME_TOKEN_REQ_KEY } from '../auth.guard';

export const RealtimeToken = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const token = request[REALTIME_TOKEN_REQ_KEY];
        if (!token) {
            throw new BadRequestException(
                'Realtime integration token not found',
            );
        }

        return token;
    },
);
