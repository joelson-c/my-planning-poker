import type { VotingRoom } from "@planningpoker/domain-models/voting/room";
import type { VotingUser } from "@planningpoker/domain-models/voting/user";
import { leaveRoom } from "./room";

export function shouldBeAdminInitially(room: VotingRoom): boolean {
  return room.users.length === 0;
}

export async function disconnectUser(
  room: VotingRoom,
  roomUser: VotingUser
): Promise<VotingUser | undefined> {
  room.users = room.users.filter(
    ({ connectionId }) => connectionId === roomUser.connectionId
  );

  let newAdmin: VotingUser | undefined = undefined;
  if (roomUser.isAdmin) {
    const sortedUsers = room.users.sort(
      ({ joinedAt: a }, { joinedAt: b }) => (a || 0) - (b || 0)
    );

    newAdmin = sortedUsers[0];
    newAdmin.isAdmin = true;
  }

  await leaveRoom(room, roomUser);

  return newAdmin;
}
