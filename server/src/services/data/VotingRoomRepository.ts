import { inject, injectable, singleton } from 'tsyringe';
import { VotingRoom } from 'my-planit-poker-shared/typings/VotingRoom';
import RandomIdGenerator from '../RandomIdGenerator';

@injectable()
@singleton()
export default class VotingRoomRepository {
    constructor(
        private rooms: Map<VotingRoom['id'], VotingRoom> = new Map(),
        private randomIdGenerator: RandomIdGenerator
    ) { }

    create(data: Omit<VotingRoom, 'id'>): string {
        const id = this.randomIdGenerator.generateRandomId(8);
        this.rooms.set(id, {...data, id});
        return id;
    }

    update(data: VotingRoom): void {
        this.rooms.set(data.id, data);
    }

    getById(id: string): VotingRoom | undefined {
        return this.rooms.get(id);
    }

    deleteById(id: string): void {
        this.rooms.delete(id);
    }
}
