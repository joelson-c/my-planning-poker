import { inject, injectable } from 'tsyringe';
import ISessionStorage from "../../../contracts/ISessionStorage";
import { UserSession } from "my-planit-poker-shared/typings/UserSession";
import RandomIdGenerator from '../../RandomIdGenerator';

@injectable()
export default class InMemorySession implements ISessionStorage {
    constructor(
        private sessions: Map<string, UserSession> = new Map(),
        private randomIdGenerator: RandomIdGenerator
    ) { }

    getAll(): UserSession[] {
        return [...this.sessions.values()];
    }

    getByUserId(userId: string): UserSession | undefined {
        return this.getAll().find((session) => session.userId === userId);
    }

    save(data: UserSession): string {
        const sessionId = this.randomIdGenerator.generateRandomId(8);
        this.sessions.set(sessionId, data);
        return sessionId;
    }

    update(data: UserSession): void {
        this.sessions.set(data.id, data);
    }

    getById(id: string): UserSession | undefined {
        return this.sessions.get(id);
    }

    closeById(id: string): void {
        this.sessions.delete(id);
    }
}
