import type * as messages from "./messages/types";

export type RealtimeMessage =
  | messages.JoinRoomMessage
  | messages.JoinedRoomMessage
  | messages.UserJoinedBroadcast
  | messages.UserLeftBroadcast
  | messages.UserVotedBroadcast
  | messages.UserChangedBroadcast
  | messages.VoteRevealMessage
  | messages.VoteRevealedBroadcast
  | messages.VoteStartMessage
  | messages.VoteStartedBroadcast
  | messages.VoteSubmitMessage
  | messages.VoteSubmittedMessage
  | messages.UserChangedBroadcast;
