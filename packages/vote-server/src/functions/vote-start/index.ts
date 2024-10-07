import type {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { getRoomByConnectionId, updateRoom } from "~/models/room";
import { broadcastToRoom } from "~/utils/broadcastToRoom";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId } = event.requestContext;

  const room = await getRoomByConnectionId(connectionId, true);
  if (!room) {
    return { statusCode: 404 };
  }

  room.state = "voting";
  await updateRoom(room);
  await broadcastToRoom(room.id, {
    type: "vote_started_broadcast",
  });

  return { statusCode: 200 };
};
