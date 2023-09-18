import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";

@injectable()
export default class HandleCreateRoom implements ICommand<{}, VotingRoom> {
    constructor(
        private roomRepository: VotingRoomRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle(): VotingRoom {
        const createdRoomId = this.roomRepository.create({} as VotingRoom);
        const roomData = this.roomRepository.getById(createdRoomId)!;
        return roomData;
    }
}
