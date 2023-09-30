import { UserSocket } from "my-planit-poker-shared/typings/ClientTypes";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SystemUser } from "my-planit-poker-shared/typings/SystemUser";

type SocketClient = {
    socket: UserSocket;
    isConnected: boolean;
    hasError: boolean;
    userInfo?: SystemUser;
}

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
}) as UserSocket;

export const SocketContext = createContext<SocketClient>({} as SocketClient);

export default function SocketClientContext({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [hasError, setHasError] = useState(false);
    const [userInfo, setUserInfo] = useState<SystemUser>();

    function onConnect() {
        setIsConnected(true);
    }

    function onDisconnect() {
        setIsConnected(false);
    }

    function onError() {
        setHasError(true);
    }

    function onConnected(user: SystemUser) {
        setUserInfo(user);
    }

    useEffect(() => {
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);
        socket.on('connected', onConnected);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
            socket.off('connected', onConnected);
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            hasError,
            isConnected,
            socket,
            userInfo
        }}>
            {children}
        </SocketContext.Provider>
    )
}
