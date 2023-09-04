import { UserSocket } from "my-planit-poker-shared/typings/ClientTypes";
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import useUserData from "../hooks/useUserData";
import { SystemUser } from "my-planit-poker-shared/typings/SystemUser";

type SocketClient = {
    socket: UserSocket;
    isConnected: boolean;
    hasError: boolean;
    userInfo?: SystemUser;
}

export const SocketContext = createContext<SocketClient>({} as SocketClient);

export default function SocketClientContext({ children }: PropsWithChildren) {
    const { username, isObserver } = useUserData();

    const socket = useMemo<UserSocket>(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
        auth: {
            username,
            isObserver
        }
    }), [username, isObserver]);

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [hasError, setHasError] = useState(false);
    const [userInfo, setUserInfo] = useState<SystemUser>();

    useEffect(() => {
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

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);
        socket.on('connected', onConnected);

        if (username) {
            socket.connect();
        }


        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
            socket.off('connected', onConnected);
            socket.disconnect();
        };
    }, [socket, username]);

    return (
        <SocketContext.Provider value={{ hasError, isConnected, socket, userInfo }}>
            {children}
        </SocketContext.Provider>
    )
}
