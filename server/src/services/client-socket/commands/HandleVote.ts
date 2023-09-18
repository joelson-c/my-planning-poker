import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import ILogger from "../../../contracts/ILogger";
import RoomUserRepository from "../../data/RoomUserRepository";
import CommandUtils from "./CommandUtils";

type CommandArgs = {
    socket: UserSocket;
    value: string;
    callback: (errorMsg?: string) => void;
}

@injectable()
export default class HandleVote implements ICommand<CommandArgs> {
    constructor(
        private roomUserRepo: RoomUserRepository,
        private commandUtils: CommandUtils,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle({ socket, value, callback }: CommandArgs): void {
        const room = this.commandUtils.getSocketRoom(socket);
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
        this.logger.debug('Client voted', { roomUser });
        callback();
    }
}
