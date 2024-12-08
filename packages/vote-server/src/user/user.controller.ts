import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { VoteDto } from './vote/vote.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { VotingUser } from '@planningpoker/domain-models';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('me')
    async me(@AuthUser() user: VotingUser) {
        return {
            user,
        };
    }

    @Post('vote')
    async vote(@AuthUser() user: VotingUser, @Body() { value }: VoteDto) {
        return {
            user: await this.userService.addVote(user.id, value),
        };
    }
}
