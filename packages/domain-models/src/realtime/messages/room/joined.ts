import type { VotingRoom } from "../../../voting/room";
import type { VotingUser } from "../../../voting/user";

export interface JoinedRoomMessage {
  type: "joined_room";
  room: VotingRoom;
  user: VotingUser;
}
