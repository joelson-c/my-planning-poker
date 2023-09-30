import useUserData from "../useUserData";
import useSocketClient from "../useSocketClient";
import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function useJoinRoom(): (roomId: VotingRoom['id']) => Promise<void> {
    const { socket } = useSocketClient();
    const { setRoomId } = useUserData();
    const navigate = useNavigate();

    async function joinRoom(roomId: VotingRoom['id']) {
        setRoomId(roomId);

        const roomUser = await socket.emitWithAck('joinRoom', roomId);
        if (!roomUser) {
            toast.error(
                'Erro ao entrar na sala. A sala não existe ou há algum problema na conexão com o servidor.'
                , { id: 'join-room-error' });

            return;
        }

        navigate(`/room/${roomId}`);
    }

    return joinRoom;
}
