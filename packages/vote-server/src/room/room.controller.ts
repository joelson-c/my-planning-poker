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
import { Token } from 'src/auth/token/token.interface';
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
import { RoomState, VotingUser } from '@planningpoker/domain-models';
import { AuthToken, AuthUser } from 'src/auth/auth.decorator';

@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly broadcastService: BroadcastService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Post('create')
    async create(@Body() { cardType }: CreateRoomDto) {
        return {
            room: await this.roomService.create({
                cardType,
            }),
        };
    }

    @Public()
    @Get(':roomId/exists')
    async exists(@Param('roomId', new ParseUUIDPipe()) roomId: string) {
        return this.roomService.getById(roomId) !== null;
    }

    @Get('mine')
    async mine(@AuthUser() user: VotingUser) {
        const room = await this.roomService.getById(user.roomId);

        return {
            room,
        };
    }

    @Get(':roomId/votes')
    async myVotes(@Param('roomId', new ParseUUIDPipe()) roomId: string) {
        const votes = await this.roomService.getRoomVotes(roomId);
        return {
            votes,
        };
    }

    @Post(':roomId/reveal')
    async reveal(@Param('roomId', new ParseUUIDPipe()) roomId: string) {
        const room = await this.roomService.updateState(
            roomId,
            RoomState.REVEAL,
        );

        await this.broadcastService.broadcastRoomState(roomId, room.state);
    }

    @Post(':roomId/reset')
    async reset(@Param('roomId', new ParseUUIDPipe()) roomId: string) {
        const room = await this.roomService.updateState(
            roomId,
            RoomState.VOTING,
        );

        await this.roomService.resetVotes(roomId);

        await this.broadcastService.broadcastRoomState(room.id, room.state);
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
            room,
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
