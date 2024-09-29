import type { Infer } from "superstruct";
import {
  boolean,
  defaulted,
  object,
  omit,
  optional,
  size,
  string,
} from "superstruct";

export const VotingUser = object({
  roomId: string(),
  connectionId: string(),
  nickname: size(string(), 2, 32),
  vote: optional(string()),
  isAdmin: defaulted(boolean(), false),
  isObserver: defaulted(boolean(), false),
});

export type VotingUser = Infer<typeof VotingUser>;
