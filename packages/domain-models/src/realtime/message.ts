import type * as roomMessages from "./messages/room";
import type * as userMessages from "./messages/user";
import type * as votingMessages from "./messages/vote";

export type RealtimeMessage =
  | roomMessages.JoinRoomMessage
  | roomMessages.JoinedRoomMessage
  | userMessages.UserJoinedBroadcast
  | userMessages.UserLeftBroadcast
  | votingMessages.RevealVoteMessage
  | votingMessages.RevealedVotesMessage
  | votingMessages.StartVoteMessage
  | votingMessages.VoteStartedBroadcast
  | votingMessages.VoteSubmitMessage
  | votingMessages.VoteSubmittedMessage;
