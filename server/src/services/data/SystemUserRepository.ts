import { inject, injectable, singleton } from 'tsyringe';
import { SystemUser } from 'my-planit-poker-shared/typings/SystemUser';
import RandomIdGenerator from '../RandomIdGenerator';

@injectable()
@singleton()
export default class SystemUserRepository {
    constructor(
        private users: Map<SystemUser['id'], SystemUser> = new Map(),
        private randomIdGenerator: RandomIdGenerator
    ) { }

    create(data: Omit<SystemUser, 'id'>): string {
        const id = this.randomIdGenerator.generateRandomId(8);
        this.users.set(id, {...data, id});
        return id;
    }

    update(data: SystemUser): void {
        this.users.set(data.id, data);
    }

    getById(id: string): SystemUser | undefined {
        return this.users.get(id);
    }

    deleteById(id: string): void {
        this.users.delete(id);
    }
}
