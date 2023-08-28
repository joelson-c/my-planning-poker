import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import SystemUserRepository from "../../data/SystemUserRepository";
import ILogger from "../../../contracts/ILogger";
import { RoomUser, VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";

type CommandArgs = {
    socket: UserSocket;
    roomId?: string;
}

@injectable()
export default class HandleConnection implements ICommand<CommandArgs, string> {
    constructor(
        private systemUserRepo: SystemUserRepository,
        private roomRepository: VotingRoomRepository,
        private roomUserRepo: RoomUserRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    handle({ socket, roomId }: CommandArgs): string {
        const userData = this.systemUserRepo.getById(socket.data.session.userId);
        socket.emit('connected', userData!);
        const roomUser = this.joinClientToRoom(socket, roomId);
        return roomUser.roomId;
    }

    private joinClientToRoom(socket: UserSocket, roomId?: string): RoomUser {
        let roomToJoin;
        if (roomId) {
            roomToJoin = this.roomRepository.getById(roomId)?.id;
        }

        if (!roomToJoin) {
            roomToJoin = this.roomRepository.create({} as VotingRoom);
        }

        socket.join(roomToJoin);
        socket.data.roomId = roomToJoin;

        const { userId } = socket.data.session;
        const roomUser: RoomUser = { userId, roomId: roomToJoin, hasVoted: false };
        this.roomUserRepo.create(roomUser);

        this.logger.info('Client joined in room', { roomUser });
        return roomUser;
    }
}
