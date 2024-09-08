import type ICommand from "../../../contracts/ICommand";
import type ILogger from "../../../contracts/ILogger";
import type { VotingRoom } from "my-planit-poker";
import { inject, injectable } from "tsyringe";
import VotingRoomRepository from "../../data/VotingRoomRepository";

@injectable()
export default class HandleCreateRoom implements ICommand<{}, VotingRoom> {
    constructor(
        private roomRepository: VotingRoomRepository,
        @inject("ILogger") private logger: ILogger,
    ) {}

    handle(): VotingRoom {
        const createdRoomId = this.roomRepository.create({} as VotingRoom);
        const roomData = this.roomRepository.getById(createdRoomId)!;
        this.logger.debug("Created new voting room", { roomId: createdRoomId });
        return roomData;
    }
}
