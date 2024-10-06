import type { VotingUser } from "../../../voting/user";

export interface UserLeftBroadcast {
  type: "user_left";
  user: VotingUser;
}
