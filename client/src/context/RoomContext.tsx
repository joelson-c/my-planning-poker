import { RoomStatusEvent } from "my-planit-poker-shared/typings/VotingRoom";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import useSocketClient from "../hooks/useSocketClient";

type RoomContext = {
    roomMeta?: RoomStatusEvent['room'];
    users?: RoomStatusEvent['users'];
}

export const RoomContext = createContext<RoomContext>({} as RoomContext);

export default function RoomContextProvider({ children }: PropsWithChildren) {
    const [roomStatus, setRoomStatus] = useState<RoomStatusEvent>();
    const { socket } = useSocketClient();

    useEffect(() => {
        function onRoomStatusUpdate(event: RoomStatusEvent) {
            setRoomStatus(event);
        }

        socket.on('roomStatus', onRoomStatusUpdate);

        return () => {
            socket.off('roomStatus', onRoomStatusUpdate);
        };
    }, [socket]);

    return (
        <RoomContext.Provider value={{ roomMeta: roomStatus?.room, users: roomStatus?.users }}>
            {children}
        </RoomContext.Provider>
    )
}
