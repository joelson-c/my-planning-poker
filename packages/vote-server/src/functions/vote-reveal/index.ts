import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import {
  collectRoomVotes,
  getRoomByConnectionId,
  updateRoom,
} from "~/models/room";
import { broadcastToRoom } from "~/utils/broadcastToRoom";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId } = event.requestContext;

  const room = await getRoomByConnectionId(connectionId, true);
  if (!room) {
    return { statusCode: 404 };
  }

  if (room.state !== "voting") {
    return { statusCode: 403 };
  }

  room.state = "vote_reveal";

  await updateRoom(room);
  await broadcastToRoom(room.id, {
    type: "vote_revealed_broadcast",
    votes: collectRoomVotes(room),
  });

  return { statusCode: 200 };
};
