import type { Infer } from "superstruct";
import {
  boolean,
  defaulted,
  object,
  size,
  string,
  optional,
  number,
} from "superstruct";

export const VotingUser = object({
  id: string(),
  roomId: string(),
  connectionId: optional(string()),
  nickname: size(string(), 2, 32),
  isAdmin: defaulted(boolean(), false),
  isObserver: defaulted(boolean(), false),
  vote: optional(string()),
  joinedAt: optional(number()),
});

export type VotingUser = Infer<typeof VotingUser>;
