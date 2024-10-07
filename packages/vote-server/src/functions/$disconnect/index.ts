import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { getRoomByConnectionId } from "~/models/room";
import { disconnectUser } from "~/models/user";
import { broadcastToRoom } from "~/utils/broadcastToRoom";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId } = event.requestContext;

  const room = await getRoomByConnectionId(connectionId);
  if (!room) {
    return { statusCode: 404 };
  }

  const roomUser = room.users.find(
    (user) => user.connectionId === connectionId
  );

  if (!roomUser) {
    throw new Error("User not found in room");
  }

  const newAdmin = await disconnectUser(room, roomUser);
  if (newAdmin) {
    await broadcastToRoom(room.id, {
      type: "user_changed_broadcast",
      isAdmin: newAdmin.isAdmin,
      isObserver: newAdmin.isObserver,
      userId: newAdmin.id,
    });
  }

  return { statusCode: 200 };
};
