import { inject, injectable } from "tsyringe";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import { UserSession } from "my-planit-poker-shared/typings/UserSession";
import IMiddleware from "../contracts/IMiddleware";
import ISessionStorage from "../contracts/ISessionStorage";
import SystemUserRepository, { CreateUserProps } from "../services/data/SystemUserRepository";
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
            const username = socket.handshake.auth.username as string | undefined;
            if (!username) {
                throw new Error("Invalid username");
            }

            session = this.openUserSession({
                username,
                isObserver: socket.handshake.auth.isObserver || false
            });

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

    private openUserSession(data: CreateUserProps): UserSession
    {
        const userId = this.systemUserRepo.create(data);

        return {
            id: this.randomIdGenerator.generateRandomId(8),
            userId: userId
        };
    }
}
