import type { VotingUser } from "@prisma/client";

export type VoteResult = Record<
  VotingUser["id"],
  Pick<VotingUser, "vote" | "nickname">
>;
