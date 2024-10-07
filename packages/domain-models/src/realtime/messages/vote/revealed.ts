import type { VotingResult } from "../../../voting/result";

export interface VoteRevealedBroadcast {
  type: "vote_revealed_broadcast";
  votes: VotingResult;
}
