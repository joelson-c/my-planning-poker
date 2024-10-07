import type { VotingRoom } from "@planningpoker/domain-models/voting/room";
import type { VotingUser } from "@planningpoker/domain-models/voting/user";
import type { VotingResult } from "@planningpoker/domain-models/voting/result";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v7 as uuidv7 } from "uuid";
import { docClient } from "~/clients/dynamoDb";

const ROOM_TABLE = "VotingRoom";
const CONNECTION_ASSOC_TABLE = "VotingRoomConnections";

export async function createRoom({
  cardType,
}: Omit<VotingRoom, "roomId">): Promise<void> {
  await docClient.send(
    new PutCommand({
      Item: {
        roomId: uuidv7(),
        cardType,
      },
      TableName: ROOM_TABLE,
    })
  );
}

export async function getRoom(
  roomId: string,
  withVotes = false
): Promise<VotingRoom | undefined> {
  const result = await docClient.send(
    new GetCommand({
      Key: { roomId: roomId },
      TableName: ROOM_TABLE,
    })
  );

  if (!result.Item) {
    return undefined;
  }

  const items = result.Item as VotingRoom;

  items.users = items.users.map((user) => {
    return {
      ...user,
      vote: withVotes ? user.vote : undefined,
      connectionId: undefined, // Avoid leaking connectionId
    };
  });

  return items;
}

export async function updateRoom(payload: VotingRoom): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      Key: { roomId: payload.id },
      TableName: ROOM_TABLE,
      UpdateExpression:
        "set users = :users, cardType = :cardType, state = :state",
      ExpressionAttributeValues: {
        ":users": payload.users,
        ":cardType": payload.cardType,
        ":state": payload.state,
      },
    })
  );
}

export async function deleteRoom(roomId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      Key: { roomId: roomId },
      TableName: ROOM_TABLE,
    })
  );
}
export async function unasignRoomToUser(
  user: VotingUser,
  room: VotingRoom
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      Key: {
        roomId: room.id,
        userId: user.connectionId,
      },
      TableName: CONNECTION_ASSOC_TABLE,
    })
  );
}

export async function getRoomByConnectionId(
  connectionId: string,
  withVotes?: boolean
): Promise<VotingRoom | undefined> {
  const result = await docClient.send(
    new GetCommand({
      Key: {
        userId: connectionId,
      },
      TableName: CONNECTION_ASSOC_TABLE,
    })
  );

  if (!result.Item) {
    return undefined;
  }

  return await getRoom(result.Item.roomId, withVotes);
}

export async function joinRoom(
  room: VotingRoom,
  user: VotingUser
): Promise<void> {
  room.users.push(user);

  const transaction = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: ROOM_TABLE,
          Key: {
            roomId: room.id,
          },
          UpdateExpression: "set users = :users",
          ExpressionAttributeValues: {
            ":users": room.users,
          },
        },
      },
      {
        Put: {
          TableName: CONNECTION_ASSOC_TABLE,
          Item: {
            roomId: room.id,
            userId: user.connectionId,
          },
        },
      },
    ],
  });

  docClient.send(transaction);
}

export async function leaveRoom(
  room: VotingRoom,
  user: VotingUser
): Promise<void> {
  room.users = room.users.filter((u) => u.connectionId !== user.connectionId);

  const transaction = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: ROOM_TABLE,
          Key: {
            roomId: room.id,
          },
          UpdateExpression: "set users = :users",
          ExpressionAttributeValues: {
            ":users": room.users,
          },
        },
      },
      {
        Delete: {
          TableName: CONNECTION_ASSOC_TABLE,
          Key: {
            roomId: room.id,
            connectionId: user.connectionId,
          },
        },
      },
    ],
  });

  docClient.send(transaction);
}

export function collectRoomVotes(room: VotingRoom) {
  return room.users.reduce<VotingResult>((acc, user) => {
    acc[user.id] = user.vote;
    return acc;
  }, {});
}
