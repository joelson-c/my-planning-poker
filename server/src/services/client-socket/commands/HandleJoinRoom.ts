import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import { RoomUser } from "my-planit-poker-shared/typings/VotingRoom";
import RoomUserRepository from "../../data/RoomUserRepository";

type CommandArgs = {
    socket: UserSocket;
    targetRoomId: string
}

@injectable()
export default class HandleJoinRoom implements ICommand<CommandArgs, RoomUser> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

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
            isModerator: this.isClientModerator(roomId)
        };

        this.roomUserRepo.create(roomUser);

        this.logger.debug('Client joined in room', { roomUser });
        return roomUser;
    }

    private isClientModerator(roomId: string): boolean {
        return !this.roomUserRepo.getByRoomId(roomId).length;
    }
}
