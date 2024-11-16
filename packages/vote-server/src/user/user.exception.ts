import { HttpException, HttpStatus } from '@nestjs/common';

export class NicknameTakenException extends HttpException {
    constructor(nickname: string) {
        super(
            `Nickname ${nickname} is already taken in the requested room`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class ObserverVoteException extends HttpException {
    constructor() {
        super(`Observers are not allowed to vote`, HttpStatus.FORBIDDEN);
    }
}
