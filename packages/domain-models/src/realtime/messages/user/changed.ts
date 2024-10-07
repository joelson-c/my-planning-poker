import type { VotingUser } from "../../../voting/user";

export interface UserChangedBroadcast {
  type: "user_changed_broadcast";
  userId: VotingUser["id"];
  isAdmin: VotingUser["isAdmin"];
  isObserver: VotingUser["isObserver"];
}
