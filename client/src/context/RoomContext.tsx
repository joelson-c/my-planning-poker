import { RoomStatusEvent, RoomStatusUsers } from "my-planit-poker-shared/typings/VotingRoom";
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";
import useSocketClient from "../hooks/useSocketClient";

const PING_FREQUENCE_MS = 5000;
const DISCONNECTED_PING = 999;

type RoomContext = {
    meta?: RoomStatusEvent['room'];
    users?: RoomStatusEvent['users'];
    currentUserData?: RoomStatusUsers;
    ping: number;
}

export const RoomContext = createContext<RoomContext>({} as RoomContext);

export default function RoomContextProvider({ children }: PropsWithChildren) {
    const [roomStatus, setRoomStatus] = useState<RoomStatusEvent>();
    const { socket, isConnected, userInfo } = useSocketClient();
    const [ping, setPing] = useState(0);

    useEffect(() => {
        function onRoomStatusUpdate(event: RoomStatusEvent) {
            setRoomStatus(event);
        }

        socket.on('roomStatus', onRoomStatusUpdate);

        return () => {
            socket.off('roomStatus', onRoomStatusUpdate);
        };
    }, [socket]);

    useEffect(() => {
        async function sendPing() {
            const start = Date.now();
            await socket.emitWithAck('ping');
            setPing(Date.now() - start);
        }

        if (!isConnected) {
            setPing(DISCONNECTED_PING);
            return;
        }

        sendPing();
        const interval = setTimeout(sendPing, PING_FREQUENCE_MS);

        return () => clearTimeout(interval);
    }, [ping, socket, isConnected]);

    const currentRoomUser = useMemo(() => {
        return roomStatus?.users.find((roomUser) => roomUser.id === userInfo?.id);
    }, [roomStatus?.users, userInfo]);

    return (
        <RoomContext.Provider value={
            {
                meta: roomStatus?.room,
                users: roomStatus?.users,
                currentUserData: currentRoomUser,
                ping
            }
        }>
            {children}
        </RoomContext.Provider>
    )
}
