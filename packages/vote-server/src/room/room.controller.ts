import { Body, Controller, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './create/create.dto';
import { AuthToken } from 'src/auth/token/token.decorator';
import { Token } from 'src/auth/token/token.interface';
import { UserService } from 'src/user/user.service';
import { BroadcastService } from 'src/broadcast/broadcast.service';

@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly broadcastService: BroadcastService,
    ) {}

    @Post('create')
    async create(@Body() { cardType }: CreateRoomDto) {
        return {
            roomId: await this.roomService.create({
                cardType,
            }),
        };
    }

    @Post('reveal')
    async reveal(@AuthToken() token: Token) {
        const user = await this.userService.getById(token.sub);
        const { room, votes } = await this.roomService.revealCards(user.roomId);
        await this.broadcastService.broadcastVoteReveal(room.id, votes);
    }

    @Post('reset')
    async reset(@AuthToken() token: Token) {
        const user = await this.userService.getById(token.sub);
        const room = await this.roomService.reset(user.roomId);
        await this.broadcastService.broadcastRoomReset(room.id);
    }

    @Post('mine')
    async mine(@AuthToken() token: Token) {
        return this.roomService.getById(token.sub, true);
    }
}
