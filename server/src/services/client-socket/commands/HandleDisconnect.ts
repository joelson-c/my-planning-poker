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
        this.roomUserRepo.deleteByUserId(userId);
        this.systemUserRepo.deleteById(userId);

        this.logger.info('Client disconnected', { userId });

        const roomUsers = this.roomUserRepo.getByRoomId(roomId);
        if (!roomUsers.length) {
            this.logger.info('Empty room will be deleted', { roomId });
            this.roomRepository.deleteById(roomId);
            return;
        }
    }
}
