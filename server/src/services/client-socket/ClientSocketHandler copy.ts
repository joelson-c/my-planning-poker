
import { inject, injectable } from 'tsyringe';
import { UserServer, UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import { RoomUser, RoomStatusUsers, VotingRoom, RoomStatusEvent } from "my-planit-poker-shared/typings/VotingRoom";
import ILogger from '../../contracts/ILogger';
import VotingRoomRepository from '../data/VotingRoomRepository';
import RoomUserRepository from '../data/RoomUserRepository';
import SystemUserRepository from '../data/SystemUserRepository';

@injectable()
export default class ClientSocketHandler {
    // TODO: Implement room select
    private roomId: string = '';

    constructor(
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        private systemUserRepo: SystemUserRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    setUpServerEvents(server: UserServer): void {
        server.on('connection', (socket) => {
            this.onClientConnected(socket);

            this.setUpSocketEvents(socket);
        });
    }

    private onClientConnected(socket: UserSocket): void {
        const userData = this.systemUserRepo.getById(socket.data.session.userId);
        socket.emit('connected', userData!);

        this.joinClientToRoom(socket);
        this.sendUpdatedRoomStatus(socket);
    }

    private setUpSocketEvents(socket: UserSocket): void {
        socket.on('disconnect', async () => {
            this.onClientDisconnect(socket);
        });

        socket.on('voted', (value, callback) => {
            this.onClientVoted(socket, value, callback);
        });

        socket.on('revealCards', () => {
            this.onRevealCardsRequested(socket);
        });

        socket.on('resetRoom', () => {
            this.onResetRoomRequested(socket);
        });
    }

    private joinClientToRoom(socket: UserSocket): RoomUser {
        if (!this.roomId) {
            this.roomId = this.roomRepository.create({} as VotingRoom);
        }

        socket.join(this.roomId);
        socket.data.roomId = this.roomId;

        const roomId = socket.data.roomId;
        const { userId } = socket.data.session;
        const roomUser: RoomUser = { userId, roomId, hasVoted: false };
        this.roomUserRepo.create(roomUser);

        this.logger.info('Client joined in room', { roomUser });
        return roomUser;

    }

    private async sendUpdatedRoomStatus(socket: UserSocket): Promise<void> {
        const roomId = socket.data.roomId;
        if (!roomId) {
            return;
        }

        const room = this.roomRepository.getById(roomId);
        if (!room) {
            return;
        }

        const roomUsers = this.roomUserRepo.getByRoomId(roomId);
        const roomStatusUsers = roomUsers.reduce<RoomStatusUsers[]>((acc, roomUser) => {
            const userData = this.systemUserRepo.getById(roomUser.userId);
            if (!userData) {
                return acc;
            }

            acc.push({
                id: userData.id,
                username: userData.username,
                hasVoted: !!roomUser.votingValue,
                votingValue: room?.hasRevealedCards ? roomUser.votingValue : undefined
            });

            return acc;
        }, []);

        const eventData: RoomStatusEvent = {
            room,
            users: roomStatusUsers
        }

        this.logger.info('Sending room users data', { eventData });
        // TODO: Implement proper user connect/disconnect events
        socket.to(roomId).emit('roomStatus', eventData);
        socket.emit('roomStatus', eventData);
    }

    private onClientDisconnect(socket: UserSocket) {
        if (!socket.data.roomId) {
            return;
        }

        const { userId } = socket.data.session;
        const { roomId } = socket.data;
        this.roomUserRepo.deleteByUserId(userId);
        this.systemUserRepo.deleteById(userId);

        this.logger.info('Client disconnected', { userId });

        const roomUsers = this.roomUserRepo.getByRoomId(roomId);
        if (!roomUsers.length) {
            this.logger.info('Empty room will be deleted', { roomId });
            this.roomRepository.deleteById(roomId);
            this.roomId = '';
            return;
        }

        this.sendUpdatedRoomStatus(socket);
    }

    private onClientVoted(socket: UserSocket, value: string, callback: (errorMsg?: string) => void) {
        const room = this.getSocketRoom(socket);
        if (room.hasRevealedCards) {
            return;
        }

        const { userId } = socket.data.session;
        const roomUser = this.roomUserRepo.getByUserId(userId);
        if (!roomUser) {
            this.logger.warn('Room user data not found for User Id', { userId });
            callback('Invalid User ID.');
            return;
        }

        roomUser.votingValue = value;
        roomUser.hasVoted = true;
        this.roomUserRepo.update(roomUser);
        this.logger.info('Client voted', { roomUser });
        this.sendUpdatedRoomStatus(socket);
        callback();
    }

    private onRevealCardsRequested(socket: UserSocket) {
        const room = this.getSocketRoom(socket);
        room.hasRevealedCards = true;
        this.roomRepository.update(room);
        this.sendUpdatedRoomStatus(socket);
        this.logger.info('Sending room voting data', { room });
    }

    private onResetRoomRequested(socket: UserSocket) {
        const { roomId } = socket.data;
        const room = this.getSocketRoom(socket);

        room.hasRevealedCards = false;
        this.roomRepository.update(room);

        const roomUsers = this.roomUserRepo.getByRoomId(roomId!);
        roomUsers.forEach(user => {
            this.roomUserRepo.update({ ...user, hasVoted: false, votingValue: undefined });
        });

        this.sendUpdatedRoomStatus(socket);
        socket.to(roomId!).emit('roomReset');

        this.logger.info('Room reset', { room });
    }

    private getSocketRoom(socket: UserSocket): VotingRoom {
        const { roomId } = socket.data;
        if (!roomId) {
            this.logger.warn('Missing room ID for client', { client: socket.data });
            throw new Error('Missing Room ID');
        }

        const room = this.roomRepository.getById(roomId);
        if (!room) {
            this.logger.warn('Voting room not found', { roomId });
            throw new Error('Voting room not found');
        }

        return room;
    }
}
