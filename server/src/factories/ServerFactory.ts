import { Server, ServerOptions } from 'socket.io';
import { UserServer } from 'my-planit-poker-shared/typings/ServerTypes';

export default class ServerFactory {
    build(options: Partial<ServerOptions>): UserServer {
        return new Server(options);
    }
}
