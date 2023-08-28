import { injectable, singleton } from 'tsyringe';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';

@injectable()
@singleton()
export default class RoomUserRepository {
    constructor(
        private roomUsers: Map<RoomUser['userId'], RoomUser> = new Map()
    ) { }

    create(data: RoomUser): string {
        this.roomUsers.set(data.userId, data);
        return data.userId;
    }

    update(data: RoomUser): void {
        this.roomUsers.set(data.userId, data);
    }

    getByUserId(userId: string): RoomUser | undefined {
        return this.roomUsers.get(userId);
    }

    getByRoomId(roomId: string): RoomUser[] {
        return [...this.roomUsers.values()].filter((user) => user.roomId === roomId);
    }

    deleteByUserId(userId: string): void {
        this.roomUsers.delete(userId);
    }
}
