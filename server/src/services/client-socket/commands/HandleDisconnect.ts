import { inject, injectable } from 'tsyringe';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';
import { UserSocket } from 'my-planit-poker-shared/typings/ServerTypes';

import VotingRoomRepository from '../../data/VotingRoomRepository';
import SystemUserRepository from '../../data/SystemUserRepository';
import RoomUserRepository from '../../data/RoomUserRepository';
import ILogger from '../../../contracts/ILogger';
import ICommand from '../../../contracts/ICommand';

type CommandArgs = {
    socket: UserSocket;
}

@injectable()
export default class HandleDisconnect implements ICommand<CommandArgs> {
    constructor(
        private systemUserRepo: SystemUserRepository,
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle({ socket }: CommandArgs): void {
        if (!socket.data.roomId) {
            return;
        }

        const { userId } = socket.data.session;
        const { roomId } = socket.data;
        const currentUserData = this.roomUserRepo.getByUserId(userId);
        if (!currentUserData) {
            return;
        }

        this.roomUserRepo.deleteByUserId(userId);
        this.systemUserRepo.deleteById(userId);

        this.logger.debug('Client disconnected', { userId });

        const roomUsers = this.roomUserRepo.getByRoomId(roomId);
        if (this.shouldDeleteEmptyRoom(roomUsers)) {
            this.logger.info('Empty room will be deleted', { roomId });
            this.roomRepository.deleteById(roomId);
            return;
        }

        if (!currentUserData.isModerator) {
            return;
        }

        const orderedUsers = roomUsers.sort((a, b) => {
            return a.userId.localeCompare(b.userId);
        });

        const newModerator = orderedUsers[0];
        if (!newModerator) {
            return;
        }

        newModerator.isModerator = true;
        this.roomUserRepo.update(newModerator);
    }

    private shouldDeleteEmptyRoom(roomUsers: RoomUser[]): boolean {
        if (roomUsers.length) {
            return false;
        }

        if (process.env.DISABLE_EMPTY_ROOM_CLEANUP &&
            process.env.NODE_ENV === 'development'
        ) {
            return false;
        }

        return true;
    }
}
