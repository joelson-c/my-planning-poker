import { Server, Socket } from "socket.io";
import { RoomStatusEvent } from "./VotingRoom";
import { UserSession } from "./UserSession";
import { SystemUser } from "./SystemUser";

export type ServerToClientEvents = {
    connected: (userData: SystemUser) => void;
    roomStatus: (users: RoomStatusEvent) => void;
    roomReset: () => void;
}

export type ClientToServerEvents = {
    voted: (value: string, callback: (errorMsg?: string) => void) => void;
    revealCards: () => void;
    resetRoom: () => void;
    setUsername: (value: string) => void;
}

export type InterServerEvents = {}

export type SocketData = {
    session: UserSession;
    roomId?: string;
}

export type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type UserServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
