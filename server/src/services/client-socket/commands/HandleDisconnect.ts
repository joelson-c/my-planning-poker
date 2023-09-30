import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import SystemUserRepository from "../../data/SystemUserRepository";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";

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
        if (
            !roomUsers.length &&
            (!process.env.DISABLE_EMPTY_ROOM_CLEANUP && process.env.NODE_ENV === 'development')
        ) {
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
}
