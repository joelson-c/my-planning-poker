import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";
import CommandUtils from "./CommandUtils";

type CommandArgs = {
    socket: UserSocket;
}

@injectable()
export default class HandleRoomReset implements ICommand<CommandArgs> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        private commandUtils: CommandUtils,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle({ socket }: CommandArgs): void {
        this.commandUtils.throwIfUserIsNotModerator(socket);
        const { roomId } = socket.data;
        const room = this.commandUtils.getSocketRoom(socket);

        room.hasRevealedCards = false;
        this.roomRepository.update(room);

        const roomUsers = this.roomUserRepo.getByRoomId(roomId!);
        roomUsers.forEach(user => {
            this.roomUserRepo.update({ ...user, hasVoted: false, votingValue: undefined });
        });

        socket.to(roomId!).emit('roomReset');

        this.logger.debug('Room reset', { room });
    }
}
