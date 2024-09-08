import type ICommand from "../../../contracts/ICommand";
import type ILogger from "../../../contracts/ILogger";
import type { ServerUserSocket } from "my-planit-poker";
import { inject, injectable } from "tsyringe";
import CommandUtils from "./CommandUtils";
import RoomUserRepository from "../../data/RoomUserRepository";

type CommandArgs = {
    socket: ServerUserSocket;
    value: string;
    callback: (errorMsg?: string) => void;
};

@injectable()
export default class HandleVote implements ICommand<CommandArgs> {
    constructor(
        private roomUserRepo: RoomUserRepository,
        private commandUtils: CommandUtils,
        @inject("ILogger") private logger: ILogger,
    ) {}

    handle({ socket, value, callback }: CommandArgs): void {
        const room = this.commandUtils.getSocketRoom(socket);
        if (room.hasRevealedCards) {
            return;
        }

        const { userId } = socket.data.session;
        const roomUser = this.roomUserRepo.getByUserId(userId);
        if (!roomUser) {
            this.logger.warn("Room user data not found for User Id", {
                userId,
            });
            throw new Error("Invalid User Id");
        }

        roomUser.votingValue = value;
        roomUser.hasVoted = true;
        this.roomUserRepo.update(roomUser);
        this.logger.debug("Client voted", { roomUser });
        callback();
    }
}
