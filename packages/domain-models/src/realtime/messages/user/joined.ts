import type { VotingUser } from "../../../voting/user";

export interface UserJoinedBroadcast {
  type: "user_joined";
  user: VotingUser;
}
