import { Body, Controller, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './create/create.dto';
import { AuthToken } from 'src/auth/token/token.decorator';
import { Token } from 'src/auth/token/token.interface';
import { UserService } from 'src/user/user.service';

@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly userService: UserService,
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
        const votes = await this.roomService.revealCards(user.roomId);
        // TODO: Broadcast votes + new state
    }

    @Post('reset')
    async reset(@AuthToken() token: Token) {
        const user = await this.userService.getById(token.sub);
        await this.roomService.reset(user.roomId);
        // TODO: Broadcast new state
    }

    @Post('mine')
    async mine(@AuthToken() token: Token) {
        return this.roomService.getById(token.sub, true);
    }
}
