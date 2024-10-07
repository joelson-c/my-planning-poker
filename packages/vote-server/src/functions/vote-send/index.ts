import type { VoteSubmitMessage } from "@planningpoker/domain-models/realtime/messages/types";
import type {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { getRoomByConnectionId, updateRoom } from "~/models/room";
import { broadcastToRoom } from "~/utils/broadcastToRoom";
import { sendMessageToClient } from "~/utils/sendMessageToClient";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (!event.body) {
    return { statusCode: 400 };
  }

  const { connectionId } = event.requestContext;

  const room = await getRoomByConnectionId(connectionId);
  if (!room) {
    return { statusCode: 404 };
  }

  if (room.state !== "voting") {
    return { statusCode: 403 };
  }

  const roomUser = room.users.find(
    (user) => user.connectionId === connectionId
  );

  if (!roomUser) {
    throw new Error("User not found in room");
  }

  const eventBody = JSON.parse(event.body) as VoteSubmitMessage;
  roomUser.vote = eventBody.value;
  await updateRoom(room);

  const messageToClient = sendMessageToClient(connectionId, {
    type: "vote_submitted",
    value: roomUser.vote,
  });

  const broadcast = broadcastToRoom(connectionId, {
    type: "user_voted_broadcast",
    userId: roomUser.id,
  });

  await Promise.all([messageToClient, broadcast]);

  return { statusCode: 200 };
};
