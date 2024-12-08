import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { SubscriptionDto } from './subscription/subscription.dto';
import { Token } from 'src/auth/token/token.interface';
import { AuthToken } from 'src/auth/auth.decorator';

@Controller('realtime')
export class RealtimeController {
    constructor(private readonly realtimeService: RealtimeService) {}

    @Post('connection')
    async connectionToken(@AuthToken() token: Token) {
        return {
            token: await this.realtimeService.generateConnectionToken(token),
        };
    }

    @Post('subscription/create/:roomId')
    async subscribeToken(
        @AuthToken() token: Token,
        @Body() { isObserver }: SubscriptionDto,
        @Param('roomId', new ParseUUIDPipe()) roomId: string,
    ) {
        const subToken = await this.realtimeService.generateSubscriptionToken(
            token,
            roomId,
            isObserver,
        );

        return {
            token: subToken,
        };
    }

    @Get('subscription/mine')
    async mineSubscription(@AuthToken() token: Token) {
        return this.realtimeService.getSubscription(token.sub);
    }
}
