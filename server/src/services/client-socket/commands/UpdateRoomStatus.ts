import { inject, injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import SystemUserRepository from "../../data/SystemUserRepository";
import ILogger from "../../../contracts/ILogger";
import VotingRoomRepository from "../../data/VotingRoomRepository";
import RoomUserRepository from "../../data/RoomUserRepository";
import { RoomStatusEvent, RoomStatusUsers } from "my-planit-poker-shared/typings/VotingRoom";

type CommandArgs = {
    socket: UserSocket;
}

@injectable()
export default class UpdateRoomStatus implements ICommand<CommandArgs, Promise<void>> {
    constructor(
        private roomRepository: VotingRoomRepository,
        private systemUserRepo: SystemUserRepository,
        private roomUserRepo: RoomUserRepository,
        @inject('ILogger') private logger: ILogger
    ) { }

    async handle({ socket }: CommandArgs): Promise<void> {
        const roomId = socket.data.roomId;
        if (!roomId) {
            return;
        }

        const room = this.roomRepository.getById(roomId);
        if (!room) {
            return;
        }

        const roomUsers = this.roomUserRepo.getByRoomId(roomId);
        const roomStatusUsers = roomUsers.reduce<RoomStatusUsers[]>((acc, roomUser) => {
            const userData = this.systemUserRepo.getById(roomUser.userId);
            if (!userData) {
                return acc;
            }

            acc.push({
                id: userData.id,
                username: userData.username,
                hasVoted: !!roomUser.votingValue,
                votingValue: room?.hasRevealedCards ? roomUser.votingValue : undefined
            });

            return acc;
        }, []);

        const eventData: RoomStatusEvent = {
            room,
            users: roomStatusUsers
        }

        this.logger.info('Sending room users data', { eventData });
        // TODO: Implement proper user connect/disconnect events
        socket.to(roomId).emit('roomStatus', eventData);
        socket.emit('roomStatus', eventData);
    }
}
