import { Server } from 'socket.io';
import { inject, injectAll, injectable, singleton } from 'tsyringe';
import { UserServer } from 'my-planit-poker-shared/typings/ServerTypes';
import IMiddleware from '../contracts/IMiddleware';
import ILogger from '../contracts/ILogger';

@injectable()
@singleton()
export default class SocketServer {
    private server?: UserServer;

    constructor(
        @injectAll('IMiddleware') private middlewares: IMiddleware[],
        @inject('ILogger') private logger: ILogger
    ) { }

    initializeServer(port: number): void {
        if (this.server) {
            return;
        }
        this.server = new Server({
            cors: {
                origin: "*", // TODO: Implement properly CORS for prod
                methods: ["GET", "POST"]
            }
        }) as UserServer;

        this.middlewares.forEach((middleware) => {
            this.server!.use((socket, next) => middleware.execute(socket, next));
        });

        this.server.listen(port);
        this.logger.info('Server listening', { port });
    }

    getServer(): UserServer {
        if (!this.server) {
            throw new Error('Server is not initialized yet!');
        }

        return this.server;
    }
}
