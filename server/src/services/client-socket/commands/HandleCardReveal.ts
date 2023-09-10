import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import CommandUtils from "./CommandUtils";

type CommandArgs = {
    socket: UserSocket;
}

@injectable()
export default class HandleCardReveal implements ICommand<CommandArgs> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private commandUtils: CommandUtils,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle({ socket }: CommandArgs): void {
        this.commandUtils.throwIfUserIsNotModerator(socket);
        const room = this.commandUtils.getSocketRoom(socket);
        room.hasRevealedCards = true;
        this.roomRepository.update(room);
        this.logger.info('Sending room voting data', { room });
    }
}
