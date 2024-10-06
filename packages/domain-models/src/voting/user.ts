import type { Infer } from "superstruct";
import { boolean, defaulted, object, size, string, union } from "superstruct";

export const VotingUser = object({
  roomId: string(),
  connectionId: string(),
  nickname: size(string(), 2, 32),
  isAdmin: defaulted(boolean(), false),
  isObserver: defaulted(boolean(), false),
});

export const VotingUserWithVote = union([
  VotingUser,
  object({ vote: string() }),
]);

export type VotingUser = Infer<typeof VotingUser>;
export type VotingUserWithVote = Infer<typeof VotingUserWithVote>;
