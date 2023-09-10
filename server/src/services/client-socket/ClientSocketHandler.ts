
import { inject, injectable } from 'tsyringe';
import { UserServer, UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import ILogger from '../../contracts/ILogger';
import HandleConnection from './commands/HandleConnection';
import HandleDisconnect from './commands/HandleDisconnect';
import HandleVote from './commands/HandleVote';
import HandleCardReveal from './commands/HandleCardReveal';
import HandleRoomReset from './commands/HandleRoomReset';
import UpdateRoomStatus from './commands/UpdateRoomStatus';

@injectable()
export default class ClientSocketHandler {
    // TODO: Implement room select
    private roomId: string = '';

    constructor(
        private handleConnection: HandleConnection,
        private handleDisconnect: HandleDisconnect,
        private handleVote: HandleVote,
        private handleCardReveal: HandleCardReveal,
        private handleRoomReset: HandleRoomReset,
        private updateRoomStatus: UpdateRoomStatus,
        @inject('ILogger') private logger: ILogger
    ) { }

    setUpServerEvents(server: UserServer): void {
        server.on('connection', (socket) => {
            this.roomId = this.handleConnection.handle({ socket, roomId: this.roomId });
            this.updateRoomStatus.handle({ socket });
            this.setUpSocketEvents(socket);
        });
    }

    private setUpSocketEvents(socket: UserSocket): void {
        socket.on('disconnect', () => {
            this.handleDisconnect.handle({ socket });
            this.updateRoomStatus.handle({ socket });
        });

        socket.on('voted', (value, callback) => {
            this.handleVote.handle({ socket, value, callback });
            this.updateRoomStatus.handle({ socket });
        });

        socket.on('revealCards', () => {
            this.handleCardReveal.handle({ socket });
            this.updateRoomStatus.handle({ socket });
        });

        socket.on('resetRoom', () => {
            this.handleRoomReset.handle({ socket });
            this.updateRoomStatus.handle({ socket });
        });

        socket.on('ping', (callback) => {
            callback();
        });
    }
}
