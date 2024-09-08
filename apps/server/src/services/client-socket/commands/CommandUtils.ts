import type ILogger from "../../../contracts/ILogger";
import type { ServerUserSocket } from "my-planit-poker";
import type { VotingRoom } from "my-planit-poker";
import { inject, injectable } from "tsyringe";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";
import UnauthorizedAccess from "../../../errors/UnauthorizedAccess";

@injectable()
export default class CommandUtils {
    constructor(
        private roomRepository: VotingRoomRepository,
        private roomUserRepository: RoomUserRepository,
        @inject("ILogger") private logger: ILogger,
    ) {}

    getSocketRoom(socket: ServerUserSocket): VotingRoom {
        const { roomId } = socket.data;
        if (!roomId) {
            this.logger.warn("Missing room Id for client", {
                client: socket.data,
            });
            throw new Error("Missing Room Id");
        }

        const room = this.roomRepository.getById(roomId);
        if (!room) {
            this.logger.warn("Voting room not found", { roomId });
            throw new Error("Voting room not found");
        }

        return room;
    }

    throwIfUserIsNotModerator(socket: ServerUserSocket): void {
        const { userId } = socket.data.session;
        const roomUser = this.roomUserRepository.getByUserId(userId);
        if (!roomUser || !roomUser.isModerator) {
            throw new UnauthorizedAccess();
        }
    }
}
