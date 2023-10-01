import { UserServer } from 'my-planit-poker-shared/typings/ServerTypes';
import { Server, ServerOptions } from 'socket.io';

export default class ServerFactory {
    build(options: Partial<ServerOptions>): UserServer {
        return new Server(options);
    }
}
