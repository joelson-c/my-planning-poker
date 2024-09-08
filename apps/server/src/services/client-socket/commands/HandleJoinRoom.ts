import type ICommand from "../../../contracts/ICommand";
import type ILogger from "../../../contracts/ILogger";
import type { ServerUserSocket } from "my-planit-poker";
import type { RoomUser } from "my-planit-poker";
import { inject, injectable } from "tsyringe";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";

type CommandArgs = {
    socket: ServerUserSocket;
    targetRoomId: string;
};

@injectable()
export default class HandleJoinRoom implements ICommand<CommandArgs, RoomUser> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        @inject("ILogger") private logger: ILogger,
    ) {}

    handle({ socket, targetRoomId }: CommandArgs): RoomUser {
        const roomToJoin = this.roomRepository.getById(targetRoomId);
        if (!roomToJoin) {
            throw new Error(`Unable to join in room with ID: ${targetRoomId}`);
        }

        const { id: roomId } = roomToJoin;
        socket.join(roomId);
        socket.data.roomId = roomId;

        const { userId } = socket.data.session;
        const { username, isObserver } = socket.handshake.auth;

        const roomUser: RoomUser = {
            userId,
            roomId,
            username,
            isObserver,
            hasVoted: false,
            isModerator: this.isClientModerator(roomId),
        };

        this.roomUserRepo.create(roomUser);

        this.logger.debug("Client joined in room", { roomUser });
        return roomUser;
    }

    private isClientModerator(roomId: string): boolean {
        return !this.roomUserRepo.getByRoomId(roomId).length;
    }
}
