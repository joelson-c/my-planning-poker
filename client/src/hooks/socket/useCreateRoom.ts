import useSocketClient from "../useSocketClient";
import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";

export default function useCreateRoom(): () => Promise<VotingRoom['id']> {
    const { socket } = useSocketClient();

    async function createRoom(): Promise<VotingRoom['id']> {
        const createdRoom = await socket.emitWithAck('createRoom');
        return createdRoom.id;
    }

    return createRoom;
}
