import type ICommand from "../../../contracts/ICommand";
import type ILogger from "../../../contracts/ILogger";
import type { ServerUserSocket } from "my-planit-poker";
import { inject, injectable } from "tsyringe";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import CommandUtils from "./CommandUtils";

type CommandArgs = {
    socket: ServerUserSocket;
};

@injectable()
export default class HandleCardReveal implements ICommand<CommandArgs> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private commandUtils: CommandUtils,
        @inject("ILogger") private logger: ILogger,
    ) {}

    handle({ socket }: CommandArgs): void {
        this.commandUtils.throwIfUserIsNotModerator(socket);
        const room = this.commandUtils.getSocketRoom(socket);
        room.hasRevealedCards = true;
        this.roomRepository.update(room);
        this.logger.debug("Sending room voting data", { room });
    }
}
