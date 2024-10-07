import type {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import type { JoinRoomMessage } from "@planningpoker/domain-models/realtime/messages/types";
import type { VotingUser } from "@planningpoker/domain-models/voting/user";
import { getRoom, joinRoom } from "~/models/room";
import { shouldBeAdminInitially } from "~/models/user";
import { sendMessageToClient } from "~/utils/sendMessageToClient";
import { broadcastToRoom } from "~/utils/broadcastToRoom";
import { v7 as uuidv7 } from "uuid";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (!event.body) {
    return { statusCode: 400 };
  }

  const { connectionId } = event.requestContext;

  const eventBody = JSON.parse(event.body) as JoinRoomMessage;
  const room = await getRoom(eventBody.roomId);
  if (!room) {
    return { statusCode: 404 };
  }

  const user = {
    id: uuidv7(),
    roomId: eventBody.roomId,
    connectionId: connectionId,
    isAdmin: shouldBeAdminInitially(room),
    isObserver: eventBody.isObserver,
    nickname: eventBody.nickname,
  } satisfies VotingUser;

  await joinRoom(room, user);

  const messageToClient = sendMessageToClient(connectionId, {
    type: "joined_room",
    room,
    user,
  });

  const broadcast = broadcastToRoom(connectionId, {
    type: "user_joined_broadcast",
    userId: user.id,
    nickname: user.nickname,
    isObserver: user.isObserver,
    isAdmin: user.isAdmin,
  });

  await Promise.all([messageToClient, broadcast]);

  return { statusCode: 200 };
};
