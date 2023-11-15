import { App } from 'uWebSockets.js';
import { Server, ServerOptions } from 'socket.io';
import { UserServer } from 'my-planit-poker-shared/typings/ServerTypes';

export default class ServerFactory {
    build(options: Partial<ServerOptions>): UserServer {
        const socketApp = App();
        const socketServer = new Server(options);
        socketServer.attachApp(socketApp);
        return socketServer;
    }
}
