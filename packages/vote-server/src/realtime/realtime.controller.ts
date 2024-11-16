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
import { AuthToken } from 'src/auth/token/token.decorator';
import { Token } from 'src/auth/token/token.interface';

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
        const { token: subToken, newAdminId } =
            await this.realtimeService.generateSubscriptionToken(
                token,
                roomId,
                isObserver,
            );

        if (newAdminId) {
            // TODO: Broadcast new admin
        }

        return {
            token: subToken,
        };
    }

    @Post('subscription/revoke')
    async revokeSubscription(@AuthToken() token: Token) {
        await this.realtimeService.revokeSubscription(token.sub);
    }

    @Get('subscription/mine')
    async mineSubscription(@AuthToken() token: Token) {
        return this.realtimeService.getSubscription(token.sub);
    }
}
