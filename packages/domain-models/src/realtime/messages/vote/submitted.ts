import type { VotingCard } from "../../../voting/card";

export interface VoteSubmittedMessage {
  type: "vote_submitted";
  value: VotingCard;
}
