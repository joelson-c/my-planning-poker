import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import IMiddleware from "../contracts/IMiddleware";
import { inject, injectable } from "tsyringe";
import { UserSession } from "my-planit-poker-shared/typings/UserSession";
import ISessionStorage from "../contracts/ISessionStorage";
import SystemUserRepository from "../services/data/SystemUserRepository";
import RandomIdGenerator from "../services/RandomIdGenerator";

@injectable()
export default class SessionMiddleware implements IMiddleware {
    constructor(
        @inject('ISessionStorage') private sessionStorage: ISessionStorage,
        private systemUserRepo: SystemUserRepository,
        private randomIdGenerator: RandomIdGenerator
    ) { }

    execute(socket: UserSocket, next: Function): void {
        const sessionId = socket.handshake.auth.sessionId;
        let session = this.getUserSession(sessionId);
        if (!session) {
            const username = socket.handshake.auth.username || 'TESTE';
            session = this.openUserSession(username);
            this.sessionStorage.save(session);
        }

        socket.data.session = session;
        next();
    }

    private getUserSession(sessionId?: string): UserSession|undefined
    {
        if (!sessionId) {
            return;
        }

        return this.sessionStorage.getById(sessionId);
    }

    private openUserSession(username?: string): UserSession
    {
        if (!username) {
            throw new Error("Invalid username");
        }

        const userId = this.systemUserRepo.create({ username });

        return {
            id: this.randomIdGenerator.generateRandomId(8),
            userId: userId
        };
    }
}
