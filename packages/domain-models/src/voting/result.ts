import type { VotingCard } from "./card";
import type { VotingUser } from "./user";

export type VotingResult = Record<VotingUser["id"], VotingCard | undefined>;
