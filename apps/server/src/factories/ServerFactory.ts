import type { ServerOptions } from "socket.io";
import type { Server } from "my-planit-poker";
import { Server as SocketServer } from "socket.io";

export default class ServerFactory {
    build(options: Partial<ServerOptions>): Server {
        return new SocketServer(options);
    }
}
