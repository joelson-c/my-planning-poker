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
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    NEW_ROOM_SUBSCRIPTION_EVENT,
    NewRoomSubscriptionEvent,
    ROOM_UNSUBSCRIBE_EVENT,
    RoomUnsubscribeEvent,
} from './events';

@Controller('realtime')
export class RealtimeController {
    constructor(
        private readonly realtimeService: RealtimeService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

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

        this.eventEmitter.emit(
            NEW_ROOM_SUBSCRIPTION_EVENT,
            new NewRoomSubscriptionEvent(token.sub, roomId),
        );

        return {
            token: subToken,
        };
    }

    @Post('subscription/revoke')
    async revokeSubscription(@AuthToken() token: Token) {
        const user = await this.realtimeService.revokeSubscription(token.sub);

        this.eventEmitter.emit(
            ROOM_UNSUBSCRIBE_EVENT,
            new RoomUnsubscribeEvent(user.id, user.roomId),
        );
    }

    @Get('subscription/mine')
    async mineSubscription(@AuthToken() token: Token) {
        return this.realtimeService.getSubscription(token.sub);
    }
}
