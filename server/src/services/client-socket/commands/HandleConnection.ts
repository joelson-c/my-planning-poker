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

    private joinClientToRoom(socket: UserSocket, targetRoom?: string): RoomUser {
        let roomToJoin;
        if (targetRoom) {
            roomToJoin = this.roomRepository.getById(targetRoom);
        }

        if (!roomToJoin) {
            const createdRoomId = this.roomRepository.create({} as VotingRoom);
            roomToJoin = this.roomRepository.getById(createdRoomId)!;
        }

        const { id: roomId } = roomToJoin;
        socket.join(roomId);
        socket.data.roomId = roomId;

        const { userId } = socket.data.session;

        const roomUser: RoomUser = {
            userId,
            roomId,
            hasVoted: false,
            isModerator: this.isClientModerator(roomId)
        };

        this.roomUserRepo.create(roomUser);

        this.logger.info('Client joined in room', { roomUser });
        return roomUser;
    }

    private isClientModerator(roomId: string): boolean {
        return !this.roomUserRepo.getByRoomId(roomId).length;
    }
}
