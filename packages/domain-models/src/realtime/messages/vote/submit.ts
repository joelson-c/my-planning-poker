import type { VotingCard } from "../../../voting/card";

export interface VoteSubmitMessage {
  type: "vote_submit";
  value: VotingCard;
}
