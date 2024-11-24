import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthToken } from 'src/auth/token/token.decorator';
import { Token } from 'src/auth/token/token.interface';
import { UserService } from './user.service';
import { VoteDto } from './vote/vote.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('me')
    async me(@AuthToken() token: Token) {
        return {
            user: await this.userService.getByToken(token),
        };
    }

    @Post('vote')
    async vote(@AuthToken() token: Token, @Body() { value }: VoteDto) {
        return {
            user: await this.userService.addVote(token.sub, value),
        };
    }
}
