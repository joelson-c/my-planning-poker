import { inject, injectable, injectAll, singleton } from 'tsyringe';
import { UserServer } from 'my-planit-poker-shared/typings/ServerTypes';

import ServerFactory from '../factories/ServerFactory';
import IMiddleware from '../contracts/IMiddleware';
import ILogger from '../contracts/ILogger';

@injectable()
@singleton()
export default class SocketServer {
    private server?: UserServer;
    private CORS_SEPARATOR = ',';

    constructor(
        @injectAll('IMiddleware') private middlewares: IMiddleware[],
        private serverFactory: ServerFactory,
        @inject('ILogger') private logger: ILogger
    ) { }

    initializeServer(port: number): void {
        if (this.server) {
            return;
        }

        let allowedOrigins: string | string[] = process.env.CORS_ORIGIN || '*';
        if (allowedOrigins === '*') {
            this.logger.warn('Using "*" as CORS Origin.');
        } else if (allowedOrigins.includes(this.CORS_SEPARATOR)) {
            allowedOrigins = allowedOrigins.split(this.CORS_SEPARATOR);
            this.logger.info(`Using "${JSON.stringify(allowedOrigins)}" as CORS Origin.`);
        } else {
            this.logger.info(`Using "${allowedOrigins}" as CORS Origin.`);
        }

        this.server = this.serverFactory.build({
            cors: {
                origin: allowedOrigins
            },
            connectionStateRecovery: {
                // the backup duration of the sessions and the packets
                maxDisconnectionDuration: 2 * 60 * 1000,
            }
        });

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
