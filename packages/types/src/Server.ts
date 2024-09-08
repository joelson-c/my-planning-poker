import type { Server as SocketServer, Socket } from "socket.io";
import type { RoomStatusEvent, RoomUser, VotingRoom } from "./VotingRoom";
import type { UserSession } from "./UserSession";
import type { SystemUser } from "./SystemUser";

export type ServerToClientEvents = {
    connected: (userData: SystemUser) => void;
    roomStatus: (users: RoomStatusEvent) => void;
    roomReset: () => void;
};

export type ClientToServerEvents = {
    voted: (value: string, callback: (errorMsg?: string) => void) => void;
    revealCards: () => void;
    resetRoom: () => void;
    setUsername: (value: string) => void;
    ping: (callback: () => void) => void;
    joinRoom: (
        roomId: VotingRoom["id"],
        callback: (userData?: RoomUser) => void
    ) => void;
    createRoom: (callback: (room: VotingRoom) => void) => void;
};

export type InterServerEvents = {};

export type SocketData = {
    session: UserSession;
    roomId?: string;
};

export type UserSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type Server = SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
