import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";
import { inject, injectable } from "tsyringe";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import ILogger from "../../../contracts/ILogger";

@injectable()
export default class CommandUtils {
    constructor(
        private roomRepository: VotingRoomRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    getSocketRoom(socket: UserSocket): VotingRoom {
        const { roomId } = socket.data;
        if (!roomId) {
            this.logger.warn('Missing room ID for client', { client: socket.data });
            throw new Error('Missing Room ID');
        }

        const room = this.roomRepository.getById(roomId);
        if (!room) {
            this.logger.warn('Voting room not found', { roomId });
            throw new Error('Voting room not found');
        }

        return room;
    }
}
