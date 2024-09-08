import type { VotingRoom } from "my-planit-poker";
import useSocketClient from "../useSocketClient";

export default function useCreateRoom(): () => Promise<VotingRoom["id"]> {
    const { socket } = useSocketClient();

    async function createRoom(): Promise<VotingRoom["id"]> {
        const createdRoom = await socket.emitWithAck("createRoom");
        return createdRoom.id;
    }

    return createRoom;
}
