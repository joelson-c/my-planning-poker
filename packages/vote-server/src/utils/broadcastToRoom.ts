import type { RealtimeMessage } from "@planningpoker/domain-models/realtime/message";
import { getRoom } from "~/models/room";
import { sendMessageToClient } from "./sendMessageToClient";

export async function broadcastToRoom(
  roomId: string,
  message: RealtimeMessage
) {
  const roomData = await getRoom(roomId);

  if (!roomData) {
    return;
  }

  const broadcastPromises = roomData.users.map((user) => {
    return sendMessageToClient(user.connectionId!, message);
  });

  return Promise.all(broadcastPromises);
}
