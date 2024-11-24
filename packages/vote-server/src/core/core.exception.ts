import { HttpException, HttpStatus } from '@nestjs/common';

export class JoinedRoomMismatch extends HttpException {
    constructor() {
        super(`The user is not joined to the room.`, HttpStatus.FORBIDDEN);
    }
}
