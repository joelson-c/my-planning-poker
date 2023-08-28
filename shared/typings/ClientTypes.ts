import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from './ServerTypes';

export type UserSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
