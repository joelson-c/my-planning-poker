import { io } from 'socket.io-client';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { RoomStatusEvent } from 'my-planit-poker-shared/typings/VotingRoom';
import { UserSocket } from 'my-planit-poker-shared/typings/ClientTypes';

import { useRootStore } from '../state/rootStore';
import useRemoteDataCleaner from '../hooks/useRemoteDataCleaner';

type SocketClient = {
    socket: UserSocket;
    isConnected: boolean;
    hasError: boolean;
}

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
}) as UserSocket;

export const SocketContext = createContext<SocketClient>({} as SocketClient);

export default function SocketClientContext({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [hasError, setHasError] = useState(false);
    const updateRoomData = useRootStore((state) => state.updateRoomData);
    const cleanData = useRemoteDataCleaner();

    function onConnect() {
        setIsConnected(true);
    }

    function onDisconnect() {
        setIsConnected(false);
        cleanData();
    }

    function onError() {
        setHasError(true);
    }

    function onRoomStatusUpdate(event: RoomStatusEvent) {
        updateRoomData(event);
    }

    useEffect(() => {
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);
        socket.on('roomStatus', onRoomStatusUpdate);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
            socket.off('roomStatus', onRoomStatusUpdate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SocketContext.Provider value={{
            hasError,
            isConnected,
            socket
        }}>
            {children}
        </SocketContext.Provider>
    )
}
