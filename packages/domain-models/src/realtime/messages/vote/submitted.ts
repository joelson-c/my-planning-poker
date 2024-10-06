import type { VotingUser } from "../../../voting/user";

export interface VoteSubmittedMessage {
  type: "vote_submitted";
  user_id: VotingUser["connectionId"];
}
