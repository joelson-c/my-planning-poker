import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFound extends HttpException {
    constructor(roomId: string) {
        super(`The Room ${roomId} was not found`, HttpStatus.BAD_REQUEST);
    }
}
