import { inject, injectable } from 'tsyringe';
import { UserServer, UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import HandleConnection from './commands/HandleConnection';
import HandleDisconnect from './commands/HandleDisconnect';
import HandleVote from './commands/HandleVote';
import HandleCardReveal from './commands/HandleCardReveal';
import HandleRoomReset from './commands/HandleRoomReset';
import UpdateRoomStatus from './commands/UpdateRoomStatus';
import HandleCreateRoom from './commands/HandleCreateRoom';
import HandleJoinRoom from './commands/HandleJoinRoom';
import ILogger from '../../contracts/ILogger';

@injectable()
export default class ClientSocketHandler {
    constructor(
        private handleConnection: HandleConnection,
        private handleDisconnect: HandleDisconnect,
        private handleVote: HandleVote,
        private handleCardReveal: HandleCardReveal,
        private handleRoomReset: HandleRoomReset,
        private updateRoomStatus: UpdateRoomStatus,
        private handleCreateRoom: HandleCreateRoom,
        private handleJoinRoom: HandleJoinRoom,
        @inject('ILogger') private logger: ILogger
    ) { }

    setUpServerEvents(server: UserServer): void {
        server.on('connection', (socket) => {
            this.handleConnection.handle({ socket });
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

        socket.on('createRoom', (callback) => {
            const room = this.handleCreateRoom.handle();
            callback(room);
        });

        socket.on('joinRoom', (roomId, callback) => {
            try {
                const roomUser = this.handleJoinRoom.handle({ socket, targetRoomId: roomId });
                this.updateRoomStatus.handle({ socket });
                callback(roomUser);
            } catch (error) {
                this.logger.warn('Error while joining the user in room ' + roomId, { error });
                callback(undefined);
            }
        });

        socket.on('ping', (callback) => {
            callback();
        });
    }
}
