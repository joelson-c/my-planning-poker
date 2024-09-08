import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./Server";

export type UserSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
