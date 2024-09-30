import type { VotingCard } from "../voting/card";
import type { VotingUser } from "../voting/user";

interface ConnectedMessage {
  type: "connected";
  roomId: string;
  connectionId: string;
}

interface VoteSendMessage {
  type: "vote_send";
  value: string;
}

interface VoteBroadcastMessage {
  type: "vote_broadcast";
  votes: Record<VotingUser["connectionId"], VotingCard>;
}

export type RealtimeMessage =
  | ConnectedMessage
  | VoteSendMessage
  | VoteBroadcastMessage;
