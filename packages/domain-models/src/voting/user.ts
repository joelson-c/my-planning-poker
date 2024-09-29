import type { Infer } from "superstruct";
import {
  boolean,
  defaulted,
  object,
  omit,
  optional,
  string,
} from "superstruct";

export const StoredVotingUser = object({
  roomId: string(),
  connectionId: string(),
  nickname: string(),
  vote: optional(string()),
  isAdmin: defaulted(boolean(), false),
  isObserver: defaulted(boolean(), false),
});

export const JoinedVotingUser = omit(StoredVotingUser, [
  "roomId",
  "connectionId",
  "isAdmin",
]);

export type StoredVotingUser = Infer<typeof StoredVotingUser>;
export type JoinedVotingUser = Infer<typeof JoinedVotingUser>;
