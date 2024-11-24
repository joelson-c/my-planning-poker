import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto';
import { AuthToken } from 'src/auth/token/token.decorator';
import { Token } from 'src/auth/token/token.interface';
import { UserService } from 'src/user/user.service';
import { BroadcastService } from 'src/broadcast/broadcast.service';
import { Public } from 'src/auth/public/public.decorator';
import { JoinRoomDto } from './dto/join.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    NEW_ROOM_SUBSCRIPTION_EVENT,
    NewRoomSubscriptionEvent,
    ROOM_UNSUBSCRIBE_EVENT,
    RoomUnsubscribeEvent,
} from './events';

@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly broadcastService: BroadcastService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Public()
    @Get(':roomId/exists')
    async exists(@Param('roomId', new ParseUUIDPipe()) roomId: string) {
        return this.roomService.getById(roomId) !== null;
    }

    @Post('create')
    async create(@Body() { cardType }: CreateRoomDto) {
        return {
            room: await this.roomService.create({
                cardType,
            }),
        };
    }

    @Post('reveal')
    async reveal(@AuthToken() token: Token) {
        const user = await this.userService.getByToken(token);
        const { room, votes } = await this.roomService.revealCards(user.roomId);
        await this.broadcastService.broadcastVoteReveal(room.id, votes);
    }

    @Post('reset')
    async reset(@AuthToken() token: Token) {
        const user = await this.userService.getById(token.sub);
        const room = await this.roomService.reset(user.roomId);
        await this.broadcastService.broadcastRoomReset(room.id);
    }

    @Get('mine')
    async mine(@AuthToken() token: Token) {
        const user = await this.userService.getByIdWithRoom(token.sub);
        return {
            room: user.room,
        };
    }

    @Post(':roomId/join')
    async join(
        @AuthToken() token: Token,
        @Param('roomId', new ParseUUIDPipe()) roomId: string,
        @Body() { isObserver }: JoinRoomDto,
    ) {
        const { room, user } = await this.roomService.joinUserToRoom(
            roomId,
            token.sub,
            isObserver,
        );

        this.eventEmitter.emit(
            NEW_ROOM_SUBSCRIPTION_EVENT,
            new NewRoomSubscriptionEvent(user, room),
        );

        return {
            room: room,
        };
    }

    @Post(':roomId/leave')
    async leave(
        @AuthToken() token: Token,
        @Param('roomId', new ParseUUIDPipe()) roomId: string,
    ) {
        const { room, user } = await this.roomService.removeUserFromRoom(
            token.sub,
            roomId,
        );

        this.eventEmitter.emit(
            ROOM_UNSUBSCRIBE_EVENT,
            new RoomUnsubscribeEvent(user, room),
        );

        return {
            room: room,
        };
    }
}
