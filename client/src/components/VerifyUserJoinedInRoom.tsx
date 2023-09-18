import { PropsWithChildren, useEffect } from "react";
import useUserData from "../hooks/useUserData";
import { useNavigate, useParams } from "react-router-dom";
import useSocketClient from "../hooks/useSocketClient";

export default function VerifyUserJoinedInRoom({ children }: PropsWithChildren) {
    const { roomId: joinedRoomId } = useUserData();
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
