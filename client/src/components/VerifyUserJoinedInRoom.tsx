import { PropsWithChildren, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSocketClient from "../hooks/useSocketClient";
import { useRootStore } from "../state/rootStore";

export default function VerifyUserJoinedInRoom({ children }: PropsWithChildren) {
    const joinedRoomId = useRootStore((state) => state.roomId);
    const navigate = useNavigate();
    const { roomId: urlRoomId } = useParams();
    const { socket } = useSocketClient();

    useEffect(() => {
        if (joinedRoomId) {
            return;
        }

        if (urlRoomId === joinedRoomId) {
            return;
        }

        navigate(urlRoomId ? `/join/${urlRoomId}` : '/join');
    }, [joinedRoomId, navigate, socket, urlRoomId]);

    return children;
}
