import { inject, injectable } from "tsyringe";
import type { UserSession, ServerUserSocket } from "my-planit-poker";
import type ISessionStorage from "../contracts/ISessionStorage";
import type IMiddleware from "../contracts/IMiddleware";
import type { CreateUserProps } from "../services/data/SystemUserRepository";
import RandomIdGenerator from "../services/RandomIdGenerator";
import SystemUserRepository from "../services/data/SystemUserRepository";

@injectable()
export default class SessionMiddleware implements IMiddleware {
    constructor(
        @inject("ISessionStorage") private sessionStorage: ISessionStorage,
        private systemUserRepo: SystemUserRepository,
        private randomIdGenerator: RandomIdGenerator,
    ) {}

    execute(socket: ServerUserSocket, next: Function): void {
        const sessionId = socket.handshake.auth.sessionId;
        let session = this.getUserSession(sessionId);
        if (!session) {
            const username = socket.handshake.auth.username as
                | string
                | undefined;
            if (!username) {
                next(new Error("Invalid username"));
                return;
            }

            session = this.openUserSession({
                username,
                isObserver: socket.handshake.auth.isObserver || false,
            });

            this.sessionStorage.save(session);
        }

        socket.data.session = session;
        next();
    }

    private getUserSession(sessionId?: string): UserSession | undefined {
        if (!sessionId) {
            return;
        }

        return this.sessionStorage.getById(sessionId);
    }

    private openUserSession(data: CreateUserProps): UserSession {
        const userId = this.systemUserRepo.create(data);

        return {
            id: this.randomIdGenerator.generateRandomId(8),
            userId: userId,
        };
    }
}
