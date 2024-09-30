import type { VotingCard } from "../voting/card";
import type { VotingRoom, VotingRoomState } from "../voting/room";
import type { VotingUser } from "../voting/user";

interface JoinRoomMessage {
  type: "join";
  roomId: string;
  nickname: string;
  isObserver: boolean;
}

interface JoinedRoomMessage {
  type: "joined";
  room: VotingRoom;
  connectionId: string;
  isAdmin: boolean;
}

interface VoteSendMessage {
  type: "vote_send";
  value: string;
  connectionId: string;
}

interface VoteBroadcastMessage {
  type: "vote_broadcast";
  votes: Record<VotingUser["connectionId"], VotingCard>;
}

interface UserListBroadcastMessage {
  type: "user_list_broadcast";
  users: Omit<VotingUser, "vote">[];
}

interface RoomStateBroadcastMessage {
  type: "room_state_broadcast";
  state: VotingRoomState;
}

export type RealtimeMessage =
  | JoinRoomMessage
  | JoinedRoomMessage
  | VoteSendMessage
  | VoteBroadcastMessage
  | UserListBroadcastMessage
  | RoomStateBroadcastMessage;
