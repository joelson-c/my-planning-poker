import type { VotingCard } from "../../../voting/card";
import type { VotingUser } from "../../../voting/user";

export interface RevealedVotesMessage {
  type: "revealed_votes";
  votes: Record<VotingUser["connectionId"], VotingCard>;
}
