import { HttpException, HttpStatus } from '@nestjs/common';

export class RoomMissingException extends HttpException {
    constructor(roomId: string) {
        super(`The Room ${roomId} was not found`, HttpStatus.NOT_FOUND);
    }
}

export class RoomClosedException extends HttpException {
    constructor(roomId: string) {
        super(
            `The Room ${roomId} does not accept new connections`,
            HttpStatus.FORBIDDEN,
        );
    }
}
