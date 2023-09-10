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

        const corsOrigin = process.env.CORS_ORIGIN || '*';
        if (corsOrigin === '*') {
            this.logger.warn('Using "*" as CORS Origin.');
        } else {
            this.logger.info(`Using "${corsOrigin}" as CORS Origin.`);
        }

        this.server = new Server({
            cors: {
                origin: corsOrigin
            },
            connectionStateRecovery: {
                // the backup duration of the sessions and the packets
                maxDisconnectionDuration: 2 * 60 * 1000,
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
